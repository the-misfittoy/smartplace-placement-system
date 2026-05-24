import bcrypt

hashes = [
    '$2b$10$WagI2TmEkQ5za9NXZ8fr3OOelun97WHo5HIO.1vC5LD3eOerIZoYm',
    '$2b$10$A5Ncf7QHb8P06GdRfc9ewuwDs0Vs92Yuah9QrvJ21rmTdLsyIKoZ.',
    '$2b$10$hy8cQObEXlXB5vwbF5uFSeVKZ4o3nbP0CW8zzkaNfPDp9KKnqBbNS',
    '$2b$10$SC5HhIZcuxqkAI6ZbaTv/uK3jmAdRNs/oSjL6zcfyjt0wtbdXWltG',
]

cands = [
    'password', 'admin', '123456', '1234', 'password123',
    'tpo_admin', 'bhupesh', 'raj', 'google_hr', 'admin123', 'qwerty',
]

for h in hashes:
    print('hash', h)
    for p in cands:
        if bcrypt.checkpw(p.encode(), h.encode()):
            print('  match', p)
