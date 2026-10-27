CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
)

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL
        REFERENCES categories(id) ON DELETE CASCADE,
    amount INT NOT NULL
        CHECK (amount > 0),
    currency CHAR(3) NOT NULL 
        DEFAULT 'PHP',
    spent_on DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL 
        DEFAULT NOW()
)

SELECT name, SUM(amount)
FROM categories c
LEFT JOIN expenses e
ON c.id = e.category_id
WHERE e.spent_on BETWEEN '2027-10-1' and '2027-10-31'
GROUP BY c.name, c.id
ORDER BY SUM(amount) DESC