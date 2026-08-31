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
    parser.add_argument("--password")
    args = parser.parse_args()
    username = args.username or input("Username: ").strip()
    password = args.password or getpass.getpass("Password: ")
    if not username or not password:
        raise SystemExit("Username and password are required")
    async with SessionLocal() as db:
        existing = await db.scalar(select(Admin).where(Admin.username == username))
        if existing:
            raise SystemExit("Admin already exists")
        db.add(Admin(username=username, password_hash=hash_password(password)))
        await db.commit()
    print(f"Admin '{username}' created")


if __name__ == "__main__":
    asyncio.run(main())
