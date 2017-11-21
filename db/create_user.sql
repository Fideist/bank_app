INSERT INTO users (username, email, img, auth_id)
VALUES (${username}, ${email}, ${img}, ${auth_id})
RETURNING *;