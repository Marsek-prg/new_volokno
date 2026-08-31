import argparse
import asyncio
import getpass

from sqlalchemy import select

from .database import SessionLocal
from .models import Admin
from .security import hash_password


async def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Volokno admin")
    parser.add_argument("--username")
    args = parser.parse_args()
    username = args.username or input("Username: ").strip()
    password = getpass.getpass("Password: ")
    confirmation = getpass.getpass("Confirm password: ")
    if not username or not password:
        raise SystemExit("Username and password are required")
    if len(password) < 12:
        raise SystemExit("Password must contain at least 12 characters")
    if password != confirmation:
        raise SystemExit("Passwords do not match")
    async with SessionLocal() as db:
        existing = await db.scalar(select(Admin).where(Admin.username == username))
        if existing:
            raise SystemExit("Admin already exists")
        db.add(Admin(username=username, password_hash=hash_password(password)))
        await db.commit()
    print(f"Admin '{username}' created")


if __name__ == "__main__":
    asyncio.run(main())
