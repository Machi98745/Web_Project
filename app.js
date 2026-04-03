const express = require('express');
const path = require('path');
const argon2 = require('@node-rs/argon2');
const con = require('./db');
const app = express();

// express all
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/view', express.static(path.join(__dirname, 'view')));

// use public all
app.use('/admin/public', express.static(path.join(__dirname, 'admin/public')));
app.use('/cook/public', express.static(path.join(__dirname, 'cook/public')));
app.use('/customer/public', express.static(path.join(__dirname, 'customer/public')));

// use view all
app.use('/admin/view', express.static(path.join(__dirname, 'admin/view')));
app.use('/cook/view', express.static(path.join(__dirname, 'cook/view')));
app.use('/customer/view', express.static(path.join(__dirname, 'customer/view')));

// get login all
app.get('/', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/view/index.html'));
});
app.get('/', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/cook/view/login.html'));
});
app.get('/admin', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/admin/view/admin-panel.html'));
});
app.get('/cook', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/cook/view/login.html'));
});
app.get('/customer', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/login.html'));
});

// get cook
app.get('/cook/view/orders', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/cook/view/orders.html'));
});
app.get('/cook/view/reviews', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/cook/view/reviews.html'));
});

// get customer
app.get('/customer/view/menu', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/menu.html'));
});
app.get('/customer/view/ordercart', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/ordercart.html'));
});
app.get('/customer/view/payment', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/payment.html'));
});
app.get('/customer/view', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/review.html'));
});
app.get('/customer/view', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, '/customer/view/status.html'));
});

app.get('/password/:raw', function (req, res) {
    const raw = req.params.raw;
    const hash = argon2.hashSync(raw);
    // console.log(hash.length);
    res.status(200).send(hash);
});

// admin login
app.post('/admin/login', async function (req, res) {
    const { adminID, password } = req.body;
    const sql = "SELECT * FROM admin WHERE username = ?";

    con.query(sql, [adminID], async function (err, results) {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid User' });

        const admin = results[0];

        try {
            if (await argon2.verify(admin.password, password)) {
                res.status(200).json({
                    adminID: admin.admin_id,
                    username: admin.username
                });
            } else {
                res.status(401).json({ message: 'Invalid Password' });
            }
        } catch (error) {
            if (password === admin.password) {
                return res.status(200).json({ adminID: admin.admin_id, username: admin.username });
            }
            res.status(500).json({ message: 'Verification error' });
        }
    });
});

// admin update cook status
app.patch('/admin/cook/:id', function (req, res) {
    const { status } = req.body;

    con.query(
        "UPDATE cooks SET status=? WHERE cook_id=?",
        [status, req.params.id],
        function (err) {
            if (err) return res.status(500).send('Error');
            res.json({ message: 'Updated' });
        }
    );
});

// admin menu add
app.post('/admin/menu', function (req, res) {
    const { name, price } = req.body;

    con.query(
        "INSERT INTO menu (name, price, status) VALUES (?, ?, 'enable')",
        [name, price],
        () => res.json({ message: 'Added' })
    );
});

// admin menu edit
app.put('/admin/menu/:id', function (req, res) {
    const { name, price } = req.body;

    con.query(
        "UPDATE menu SET name=?, price=? WHERE menu_id=?",
        [name, price, req.params.id],
        () => res.json({ message: 'Updated' })
    );
});

// admin menu disable/enable
app.patch('/admin/menu/:id', function (req, res) {
    const { status } = req.body;

    con.query(
        "UPDATE menu SET status=? WHERE menu_id=?",
        [status, req.params.id],
        () => res.json({ message: 'Updated' })
    );
});

// admin dashboard
app.get('/admin/dashboard', function (req, res) {
    const totalsSql = `
        SELECT 
            COUNT(DISTINCT customer_id) AS total_customers,
            SUM(total_price) AS total_payment
        FROM payment
    `;

    const reviewsSql = "SELECT COUNT(*) AS total_reviews FROM review";

    const topSql = `
        SELECT m.menu_id, m.name, COUNT(*) AS count
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        GROUP BY m.menu_id
        ORDER BY count DESC
        LIMIT 6
    `;

    con.query(totalsSql, function (err, totalsRes) {
        if (err) return res.status(500).json({ message: 'Server error' });

        con.query(reviewsSql, function (err, reviewsRes) {
            if (err) return res.status(500).json({ message: 'Server error' });

            con.query(topSql, function (err, topRes) {
                if (err) return res.status(500).json({ message: 'Server error' });

                res.json({
                    ...totalsRes[0],
                    ...reviewsRes[0],
                    top_menu: topRes
                });
            });
        });
    });
});

// admin cooks list
app.get('/admin/cooks', function (req, res) {
    con.query("SELECT cook_id, username AS name, status FROM cooks", function (err, results) {
        if (err) return res.status(500).json({ message: 'Unable to fetch cooks' });
        res.json(results);
    });
});

// admin cook delete
app.delete('/admin/cooks/:id', function (req, res) {
    con.query("DELETE FROM cooks WHERE cook_id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete cook failed' });
        res.json({ message: 'Cook deleted' });
    });
});

// admin menu list
app.get('/admin/menu', function (req, res) {
    con.query("SELECT menu_id, name, price, status FROM menu", function (err, results) {
        if (err) return res.status(500).json({ message: 'Unable to fetch menu' });
        const normalized = results.map(item => ({
            ...item,
            cat: item.cat || 'General',
            enabled: item.status === 'enable'
        }));
        res.json(normalized);
    });
});

// admin menu delete
app.delete('/admin/menu/:id', function (req, res) {
    con.query("DELETE FROM menu WHERE menu_id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete menu failed' });
        res.json({ message: 'Menu deleted' });
    });
});

// admin orders list
app.get('/admin/orders', function (req, res) {
    const sql = `
        SELECT 
            o.order_id,
            c.table_number,
            GROUP_CONCAT(CONCAT(m.name, ' x', oi.quantity) SEPARATOR ', ') AS items,
            o.created_at,
            SUM(m.price * oi.quantity) AS total,
            MAX(oi.status) AS status
        FROM ` + '`order`' + ` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN menu m ON oi.menu_id = m.menu_id
        JOIN customer c ON o.customer_id = c.customer_id
        GROUP BY o.order_id
        ORDER BY o.created_at DESC
    `;

    con.query(sql, function (err, results) {
        if (err) return res.status(500).json({ message: 'Unable to fetch orders' });
        res.json(results);
    });
});

// admin payments list
app.get('/admin/payments', function (req, res) {
    const sql = `
        SELECT p.payment_id, p.customer_id, c.table_number, p.total_price, p.paid_at
        FROM payment p
        LEFT JOIN customer c ON p.customer_id = c.customer_id
        ORDER BY p.paid_at DESC
    `;

    con.query(sql, function (err, results) {
        if (err) return res.status(500).json({ message: 'Unable to fetch payments' });
        res.json(results);
    });
});

// admin reviews list
app.get('/admin/reviews', function (req, res) {
    const sql = `
        SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at
        FROM review r
        LEFT JOIN customer c ON r.customer_id = c.customer_id
        ORDER BY r.created_at DESC
    `;

    con.query(sql, function (err, results) {
        if (err) return res.status(500).json({ message: 'Unable to fetch reviews' });
        res.json(results);
    });
});

// ------------------------------------ cook routes ------------------------------------
// cook login
app.post('/cook/login', async function (req, res) {
    const { cookId, password } = req.body;
    const sql = "SELECT cook_id, username, password FROM cooks WHERE username = ?";

    con.query(sql, [cookId], async function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid Cook ID' });
        }

        const cook = results[0];

        try {
            const isMatch = await argon2.verify(cook.password, password);

            if (isMatch) {
                return res.status(200).json({
                    cookId: cook.cook_id,
                    name: cook.username
                });
            } else {
                return res.status(401).json({ message: 'Invalid Password' });
            }
        } catch (error) {
            if (password === cook.password) {
                return res.status(200).json({
                    cookId: cook.cook_id,
                    name: cook.username
                });
            }
            console.error("Argon2 error:", error);
            res.status(500).json({ message: 'Verification error' });
        }
    });
});

// cook orders
app.get('/cook/orders', function (req, res) {
    const { status } = req.query;

    const sql = `
        SELECT 
            oi.order_item_id,
            oi.order_id,
            m.name AS menu_name,   -- 🔥 alias ให้ตรง frontend
            oi.quantity,
            oi.status,
            o.customer_id,
            c.table_number,
            o.created_at
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        JOIN customer c ON o.customer_id = c.customer_id
        WHERE oi.status = ?
        ORDER BY o.created_at ASC
    `;

    con.query(sql, [status || 'pending'], function (err, results) {
        if (err) {
            console.error("DB ERROR:", err);
            return res.status(500).json({ message: 'DB error' });
        }
        res.status(200).json(results);
    });
});

// update status cook
app.patch('/cook/order-item/:id', function (req, res) {
    const { status, cookId } = req.body;

    const validStatus = ['cooking', 'serving'];

    if (!validStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const sql = `
        UPDATE order_item 
        SET status = ?, updated_by = ?
        WHERE order_item_id = ?
    `;

    con.query(sql, [status, cookId, req.params.id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Update failed' });
        }

        res.status(200).json({ message: 'Updated successfully' });
    });
});

// dashboard cook
app.get('/cook/dashboard', function (req, res) {
    // Return overall served count and top menu items
    const totalSql = `SELECT COUNT(*) AS total_served FROM order_item WHERE status = 'serving'`;
    const topSql = `
        SELECT m.menu_id, m.name, COUNT(*) AS count
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        WHERE oi.status = 'serving'
        GROUP BY m.menu_id
        ORDER BY count DESC
        LIMIT 6
    `;

    con.query(totalSql, function (err, totalRes) {
        if (err) return res.status(500).json({ message: 'DB error' });

        con.query(topSql, function (err, topRes) {
            if (err) return res.status(500).json({ message: 'DB error' });
            res.json({ total_served: totalRes[0].total_served || 0, top_items: topRes });
        });
    });
});

// cook reviews
app.get('/cook/reviews', function (req, res) {
    // check if rating column exists, then select accordingly
    con.query("SHOW COLUMNS FROM review LIKE 'rating'", function (err, cols) {
        if (err) return res.status(500).json({ message: 'Unable to fetch reviews' });

        const hasRating = Array.isArray(cols) && cols.length > 0;
        const sqlWithRating = `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at, r.rating
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `;
        const sql = hasRating ? sqlWithRating : `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `;

        con.query(sql, function (err2, results) {
            if (err2) return res.status(500).json({ message: 'Unable to fetch reviews' });
            res.json(results);
        });
    });
});
// ------------------------------------ end cook routes ------------------------------------



// ------------------------------------ customer routes ------------------------------------
// customer login
app.post('/customer/login', function (req, res) {
    const { tableNumber } = req.body;
    const tNum = parseInt(tableNumber, 10);

    if (Number.isNaN(tNum) || tNum <= 0) {
        return res.status(400).json({ message: 'Invalid table number' });
    }

    const findSql = "SELECT customer_id, status FROM customer WHERE table_number = ? ORDER BY created_at DESC LIMIT 1";
    con.query(findSql, [tNum], function (err, results) {
        if (err) {
            console.error('customer/login select error', err);
            return res.status(500).json({ message: 'Server error', error: err.sqlMessage || err.message });
        }

        if (results.length > 0) {
            const customer = results[0];

            if (customer.status === 'active') {
                return res.status(403).json({ message: 'This table is currently occupied!' });
            }

            if (customer.status === 'paid' || customer.status === 'inactive') {
                const updateSql = "UPDATE customer SET status='active', created_at=NOW() WHERE customer_id = ?";
                return con.query(updateSql, [customer.customer_id], function (err2) {
                    if (err2) {
                        console.error('customer/login update error', err2);
                        return res.status(500).json({ message: 'Server error', error: err2.sqlMessage || err2.message });
                    }
                    return res.status(200).json({ customerId: customer.customer_id, tableNumber: tNum });
                });
            }

            return res.status(200).json({ customerId: customer.customer_id, tableNumber: tNum });
        }

        const insertSql = "INSERT INTO customer (table_number, created_at, status) VALUES (?, NOW(), 'active')";
        con.query(insertSql, [tNum], function (err2, result) {
            if (err2) {
                console.error('customer/login insert error', err2);
                return res.status(500).json({ message: 'Server error', error: err2.sqlMessage || err2.message });
            }
            res.status(200).json({ customerId: result.insertId, tableNumber: tNum });
        });
    });
});

// customer menu
app.get('/customer/menu-data', function (req, res) {
    const search = req.query.search || '';

    const sql = `
        SELECT * FROM menu 
        WHERE status = 'enable' 
        AND name LIKE ?
    `;

    con.query(sql, [`%${search}%`], function (err, results) {
        if (err) {
            console.error('customer/menu-data DB error:', err);
            return res.status(500).json({ message: 'DB error', error: err.sqlMessage || err.message });
        }
        res.json(results);
    });
});

// customer order
app.post('/customer/place-order', function (req, res) {
    const { customerId, items } = req.body;

    if (!items || items.length === 0)
        return res.status(400).json({ message: 'No items' });

    const checkSql = "SELECT status FROM customer WHERE customer_id = ?";

    con.query(checkSql, [customerId], function (err, results) {
        if (err) {
            console.error('place-order check customer error:', err);
            return res.status(500).json({ message: 'Server error', error: err.sqlMessage || err.message });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (results[0].status !== 'active') {
            return res.status(403).json({
                message: 'You already paid. Cannot order again.'
            });
        }

        const orderSql = "INSERT INTO `order` (customer_id, created_at) VALUES (?, NOW())";

        con.query(orderSql, [customerId], function (err, result) {
            if (err) return res.status(500).send('Order failed');

            const orderId = result.insertId;

            const itemValues = items.map(item => [
                orderId,
                item.menu_id,
                1,
                'pending',
                0 // default to 0 meaning no cook assigned yet
            ]);

            const sql = "INSERT INTO order_item (order_id, menu_id, quantity, status, updated_by) VALUES ?";
            con.query(sql, [itemValues], function (err) {
                if (err) {
                    console.error('place-order order_item insert error:', err);
                    return res.status(500).json({ message: 'Item insert error', error: err.sqlMessage || err.message });
                }

                res.json({ orderId });
            });
        });
    });
});

//customer status
app.get('/customer/order-status/:orderId', function (req, res) {
    const orderId = req.params.orderId;
    const sql = `
        SELECT oi.menu_id, m.name, m.price, oi.quantity, oi.status 
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        WHERE oi.order_id = ?`;

    con.query(sql, [orderId], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.status(200).json(results);
    });
});

//customer complete payment
app.post('/customer/complete-payment', function (req, res) {
    const { customerId, totalPrice } = req.body;

    const sql = `
        INSERT INTO payment (customer_id, total_price, paid_at)
        VALUES (?, ?, NOW())
    `;

    con.query(sql, [customerId, totalPrice], function (err) {
        if (err) return res.status(500).send('Payment error');

        con.query(
            "UPDATE customer SET status='paid' WHERE customer_id=?",
            [customerId]
        );

        res.json({ message: 'Paid' });
    });
});

//customer review
app.post('/customer/submit-review', function (req, res) {
    const { customerId, comment, rating } = req.body;

    // If rating provided, try to insert with rating column. If column missing, create it and retry.
    function insertWithoutRating() {
        const sql = "INSERT INTO review (customer_id, comment, created_at) VALUES (?, ?, NOW())";
        con.query(sql, [customerId, comment], function (err, result) {
            if (err) return res.status(500).send('Review Error');
            res.status(201).json({ message: 'Review saved' });
        });
    }

    if (typeof rating === 'number') {
        const sql = "INSERT INTO review (customer_id, comment, rating, created_at) VALUES (?, ?, ?, NOW())";
        con.query(sql, [customerId, comment, rating], function (err, result) {
            if (!err) return res.status(201).json({ message: 'Review saved' });

            // If column doesn't exist (unknown column), attempt to add column then retry
            const isUnknownCol = err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054);
            if (isUnknownCol) {
                con.query("ALTER TABLE review ADD COLUMN rating TINYINT NULL", function (aerr) {
                    if (aerr) {
                        console.error('Failed to add rating column', aerr);
                        return insertWithoutRating();
                    }
                    // retry insert with rating
                    con.query(sql, [customerId, comment, rating], function (err2) {
                        if (err2) return insertWithoutRating();
                        res.status(201).json({ message: 'Review saved' });
                    });
                });
                return;
            }

            // other errors
            console.error('Review insert error', err);
            return insertWithoutRating();
        });
    } else {
        insertWithoutRating();
    }
});

// history payment customer
app.get('/customer/payment-history/:customerId', function (req, res) {
    const customerId = req.params.customerId;
    const sql = "SELECT total_price, paid_at FROM payment WHERE customer_id = ? ORDER BY paid_at DESC LIMIT 1";

    con.query(sql, [customerId], function (err, results) {
        if (err) return res.status(500).send('Database error');
        res.status(200).json(results[0] || {});
    });
});

// history review customer
app.get('/customer/review-history/:customerId', function (req, res) {
    const customerId = req.params.customerId;
    const sql = "SELECT comment, created_at FROM review WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1";

    con.query(sql, [customerId], function (err, results) {
        if (err) return res.status(500).send('Database error');
        res.status(200).json(results[0] || {});
    });
});
// leave customer
app.post('/customer/logout/:customerId', function (req, res) {
    const customerId = req.params.customerId;
    const sql = "UPDATE customer SET status = 'paid' WHERE customer_id = ?";

    con.query(sql, [customerId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Logout failed');
        }
        res.status(200).json({ message: 'Session closed' });
    });
});
// ------------------------------------ end customer routes ------------------------------------

// admin create
app.post('/cook/register', function (req, res) {
    const { cookId, name, password } = req.body;

    const checkSql = "SELECT cook_id FROM cooks WHERE cook_id = ?";
    con.query(checkSql, [cookId], function (err, results) {
        if (err) return res.status(500).send('Server error');
        if (results.length > 0) return res.status(409).json({ message: 'Cook ID already exists' });

        const hash = argon2.hashSync(password);
        const insertSql = "INSERT INTO cooks (username, password, status) VALUES (?, ?, 'enable')";
        con.query(insertSql, [cookId, hash], function (err) {
            if (err) return res.status(500).send('Server error');
            res.status(201).json({ message: 'Account created' });
        });
    });
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000');
});