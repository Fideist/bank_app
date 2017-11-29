CREATE TABLE IF NOT EXISTS balances (
    id SERIAL PRIMARY KEY,
    balance VARCHAR(20),
    user_id integer,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
