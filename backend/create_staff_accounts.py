
from getpass import getpass

from app.database import SessionLocal
from app.models.user import User
from app.models.department import Department
from app.utils.security import hash_password


def create_account(db, role, department_id=None):
    print(f"\n--- Create {role.upper()} account ---")

    name = input("Name: ").strip()
    email = input("Email: ").strip().lower()
    mobile = input("Mobile number (optional): ").strip() or None

    if not name or not email:
        raise ValueError("Name and email are required.")

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise ValueError(f"An account with {email} already exists.")

    password = getpass("Password: ")
    confirm_password = getpass("Confirm password: ")

    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")

    if password != confirm_password:
        raise ValueError("Passwords do not match.")

    account = User(
        name=name,
        email=email,
        mobile=mobile,
        password_hash=hash_password(password),
        role=role,
        department_id=department_id
    )

    db.add(account)
    db.flush()

    print(f"{role.upper()} account prepared successfully. User ID: {account.id}")


def main():
    db = SessionLocal()

    try:
        department = db.query(Department).filter(
            Department.id == 1
        ).first()

        if not department:
            raise ValueError("Department ID 1 was not found.")

        print("CM Kerala Grievance Portal - Staff Account Setup")

        create_account(db, "cmo_admin")

        print(f"\nOfficer department: {department.name}")
        create_account(db, "officer", department_id=department.id)

        db.commit()
        print("\nBoth staff accounts were created successfully.")

    except Exception as error:
        db.rollback()
        print(f"\nAccount setup failed: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
