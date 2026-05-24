import os
import mysql.connector
import bcrypt
import random
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "placement")
}

def seed_database():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    print("Clearing existing data...")
    # 1. Disable FK checks to allow truncation
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    
    # 2. Truncate tables in reverse order of dependencies
    tables_to_clear = [
        "bot_query", "dream_company_application", "offer", "result", "round",
        "application", "student_profile_history", "users", "placement_drive",
        "student", "company", "voice_bot"
    ]
    
    for table in tables_to_clear:
        cursor.execute(f"TRUNCATE TABLE {table};")
        
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    print("Database cleared.")

    # 3. Seed Companies (Required for Drives)
    print("Seeding companies...")
    companies = [
        (1, 'TCS', 'Developer', 6.50, 2, 4.00),
        (2, 'Infosys', 'Developer', 6.50, 2, 3.50),
        (3, 'Google', 'SDE', 8.50, 0, 40.00)
    ]
    cursor.executemany("INSERT INTO company (company_id, company_name, role, min_cgpa, max_backlogs, package) VALUES (%s, %s, %s, %s, %s, %s)", companies)

    # 4. Generate 100 Students and Users
    print("Generating 100 students and users...")
    pwd_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
    
    for i in range(1, 101):
        # Insert into student table
        cursor.execute(
            "INSERT INTO student (student_id, name, branch, cgpa, placement_status, active_backlogs, graduation_year, degree_type) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (i, f"Student {i}", "CSE", 8.0, "Not Placed", 0, 2026, 'BTech')
        )
        
        # Insert into users table linked to student
        cursor.execute(
            "INSERT INTO users (username, password_hash, role, student_id, email) VALUES (%s, %s, %s, %s, %s)",
            (f"student{i}", pwd_hash, 'student', i, f"student{i}@univ.edu")
        )

    # 5. Create Placement Drives
    print("Creating placement drives...")
    cursor.execute("INSERT INTO placement_drive (drive_id, drive_date, drive_type, company_id) VALUES (%s, %s, %s, %s)", (1, '2026-06-01', 'On Campus', 1))
    cursor.execute("INSERT INTO placement_drive (drive_id, drive_date, drive_type, company_id) VALUES (%s, %s, %s, %s)", (2, '2026-06-15', 'On Campus', 2))

    # 6. Create Sample Applications
    print("Creating sample applications...")
    for i in range(1, 21): # Link first 20 students to drive 1
        cursor.execute("INSERT INTO application (eligibility_status, application_status, student_id, drive_id) VALUES (%s, %s, %s, %s)",
                       ('Eligible', 'Pending', i, 1))

    conn.commit()
    cursor.close()
    conn.close()
    print("Database seeded successfully with 100 records!")

if __name__ == "__main__":
    seed_database()