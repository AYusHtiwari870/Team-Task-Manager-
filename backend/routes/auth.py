from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import schemas
from database import get_db
from core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta, datetime
import os
import secrets
from jose import JWTError, jwt
from bson import ObjectId
from typing import List

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    from core.security import SECRET_KEY, ALGORITHM
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    user = await db.users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return user

async def require_admin(current_user = Depends(get_current_user)):
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.post("/signup", response_model=schemas.UserOut)
async def create_user(user: schemas.UserCreate, db = Depends(get_db)):
    db_user = await db.users.find_one({"email": user.email})
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = await db.users.find_one({"username": user.username})
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    
    # Automatically make the first user an Admin for ease of testing
    count = await db.users.count_documents({})
    if count == 0:
        role = "Admin"
    else:
        role = user.role if user.role else "Member"

    user_dict = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": role
    }
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = await db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

# ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserOut])
async def list_all_users(db = Depends(get_db), current_user = Depends(require_admin)):
    """List all registered users (Admin only)."""
    users = await db.users.find().to_list(500)
    return users

@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
async def update_user_role(
    user_id: str,
    role_update: schemas.UserRoleUpdate,
    db = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Change a user's role (Admin only)."""
    if role_update.role not in ("Admin", "Member"):
        raise HTTPException(status_code=400, detail="Role must be 'Admin' or 'Member'")
    
    # Prevent admins from demoting themselves
    if str(current_user["_id"]) == user_id and role_update.role != "Admin":
        raise HTTPException(status_code=400, detail="You cannot demote yourself")

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role_update.role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return updated_user

@router.delete("/users/{user_id}", response_model=schemas.MessageResponse)
async def delete_user(
    user_id: str,
    db = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete a user account (Admin only)."""
    # Prevent admins from deleting themselves
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# ─── FORGOT / RESET PASSWORD ───────────────────────────────────────────────

@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(request: schemas.ForgotPasswordRequest, db = Depends(get_db)):
    """Generate a password reset token. The reset link is printed to server logs."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Return success even if user doesn't exist (security best practice)
        return {"message": "If that email is registered, a reset link has been sent."}
    
    # Generate a secure reset token
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expires": expires}}
    )
    
    # Log the reset link (in production, send this via email)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET LINK for {user['email']}:")
    print(f"{reset_link}")
    print(f"{'='*60}\n")
    
    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password", response_model=schemas.MessageResponse)
async def reset_password(request: schemas.ResetPasswordRequest, db = Depends(get_db)):
    """Reset a user's password using a valid reset token."""
    user = await db.users.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token has expired
    if user.get("reset_token_expires") and user["reset_token_expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update the password and remove the token
    hashed_password = get_password_hash(request.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"hashed_password": hashed_password},
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )
    
    return {"message": "Password has been reset successfully. You can now log in."}
