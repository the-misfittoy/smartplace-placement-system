import bcrypt

passwords = ["student123", "tpo123", "company123"]

print("--- COPY THESE SECURE HASHES FOR YOUR SQL SEED ---")
for pw in passwords:
    hashed = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt())
    print(f"Plain: {pw} -> Hash: {hashed.decode('utf-8')}")