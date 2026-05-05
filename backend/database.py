import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is not set!")

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000, 
    tls=True,
    tlsAllowInvalidCertificates=False,
)

database = client["Ethra"]

async def get_db():
    return database