CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username varchar(255),
    email varchar(255),
    img TEXT,
    auth_id TEXT
);