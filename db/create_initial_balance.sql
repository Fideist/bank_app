insert into balances
(balance, user_id)
VALUES ($1, $2)
returning *;
