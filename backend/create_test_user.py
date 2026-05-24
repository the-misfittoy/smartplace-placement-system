import os
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector
import bcrypt

# Edit these values as needed.
NEW_USERNAME = "test_user"
NEW_PASSWORD = "Test@1234"
NEW_ROLE = "student"
NEW_STUDENT_ID = 1

# Load environment variables from the project .env file.
load_dotenv(Path(__file__).resolve().parent / ".env")

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
)

try:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (NEW_USERNAME,))
    if cursor.fetchone():
        print(f"User '{NEW_USERNAME}' already exists.")
    else:
        hashed = bcrypt.hashpw(NEW_PASSWORD.encode(), bcrypt.gensalt()).decode()
        cursor.execute(
            "INSERT INTO users(username, password, role, student_id) VALUES (%s, %s, %s, %s)",
            (NEW_USERNAME, hashed, NEW_ROLE, NEW_STUDENT_ID),
        )
        conn.commit()
        print(f"Created user '{NEW_USERNAME}' with password '{NEW_PASSWORD}'.")
finally:
    cursor.close()
    conn.close()
