const express = require("express");
const path = require("path");
const argon2 = require("@node-rs/argon2");
const con = require("./db");
const app = express();

// express all
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/view", express.static(path.join(__dirname, "view")));

// use public all
app.use("/admin/public", express.static(path.join(__dirname, "admin/public")));
app.use("/cook/public", express.static(path.join(__dirname, "cook/public")));
app.use(
  "/customer/public",
  express.static(path.join(__dirname, "customer/public")),
);

// use view all
app.use("/admin/view", express.static(path.join(__dirname, "admin/view")));
app.use("/cook/view", express.static(path.join(__dirname, "cook/view")));
app.use(
  "/customer/view",
  express.static(path.join(__dirname, "customer/view")),
);

// get login all
app.get("/", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/view/index.html"));
});
app.get("/admin", function (req, res) {
  res
    .status(200)
    .sendFile(path.join(__dirname, "/admin/view/admin-panel.html"));
});
app.get("/cook", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/cook/view/login.html"));
});
app.get("/customer", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/customer/view/login.html"));
});

// get cook
app.get("/cook/view/orders", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/cook/view/orders.html"));
});
app.get("/cook/view/reviews", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/cook/view/reviews.html"));
});

// get customer
app.get("/customer/view/menu", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/customer/view/menu.html"));
});
app.get("/customer/view/ordercart", function (req, res) {
  res
    .status(200)
    .sendFile(path.join(__dirname, "/customer/view/ordercart.html"));
});
app.get("/customer/view/payment", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "/customer/view/payment.html"));
});

app.get("/password/:raw", function (req, res) {
  const raw = req.params.raw;
  const hash = argon2.hashSync(raw);
  // console.log(hash.length);
  res.status(200).send(hash);
});

// ------------------------------------ admin routes ------------------------------------
// admin login
app.post("/admin/login", async function (req, res) {
  const { adminID, password } = req.body;
  const sql = "SELECT * FROM admin WHERE username = ?";

  con.query(sql, [adminID], async function (err, results) {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid User" });

    const admin = results[0];

    try {
      if (await argon2.verify(admin.password, password)) {
        res.status(200).json({
          adminID: admin.admin_id,
          username: admin.username,
        });
      } else {
        res.status(401).json({ message: "Invalid Password" });
      }
    } catch (error) {
      if (password === admin.password) {
        return res
          .status(200)
          .json({ adminID: admin.admin_id, username: admin.username });
      }
      res.status(500).json({ message: "Verification error" });
    }
  });
});

// admin update cook status
app.patch("/admin/cook/:id", function (req, res) {
  const { status } = req.body;

  con.query(
    "UPDATE cooks SET status=? WHERE cook_id=?",
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).send("Error");
      res.json({ message: "Updated" });
    },
  );
});

// admin menu add
app.post("/admin/menu", function (req, res) {
  const { name, price } = req.body;

  con.query(
    "INSERT INTO menu (name, price, status) VALUES (?, ?, 'enable')",
    [name, price],
    () => res.json({ message: "Added" }),
  );
});

// admin menu edit
app.put("/admin/menu/:id", function (req, res) {
  const { name, price } = req.body;

  con.query(
    "UPDATE menu SET name=?, price=? WHERE menu_id=?",
    [name, price, req.params.id],
    () => res.json({ message: "Updated" }),
  );
});

// admin menu disable/enable
app.patch("/admin/menu/:id", function (req, res) {
  const { status } = req.body;

  con.query(
    "UPDATE menu SET status=? WHERE menu_id=?",
    [status, req.params.id],
    () => res.json({ message: "Updated" }),
  );
});

// admin dashboard
app.get("/admin/dashboard", function (req, res) {
  const { start, end } = req.query;

  // Build WHERE clauses for optional date range
  const paymentWhere = [];
  const paymentParams = [];
  const reviewWhere = [];
  const reviewParams = [];
  const orderWhere = [];
  const orderParams = [];

  if (start) {
    paymentWhere.push("p.paid_at >= ?");
    paymentParams.push(start);
    reviewWhere.push("r.created_at >= ?");
    reviewParams.push(start);
    orderWhere.push("o.created_at >= ?");
    orderParams.push(start);
  }
  if (end) {
    paymentWhere.push("p.paid_at <= ?");
    paymentParams.push(end);
    reviewWhere.push("r.created_at <= ?");
    reviewParams.push(end);
    orderWhere.push("o.created_at <= ?");
    orderParams.push(end);
  }

  const totalsSql = `
        SELECT 
            COUNT(DISTINCT p.customer_id) AS total_customers,
            SUM(p.total_price) AS total_payment
        FROM payment p
        ${paymentWhere.length ? "WHERE " + paymentWhere.join(" AND ") : ""}
    `;

  const reviewsSql = `SELECT COUNT(*) AS total_reviews FROM review r ${reviewWhere.length ? "WHERE " + reviewWhere.join(" AND ") : ""}`;

  const topSql = `
        SELECT m.menu_id, m.name, COUNT(*) AS count
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        ${orderWhere.length ? "WHERE " + orderWhere.join(" AND ") : ""}
        GROUP BY m.menu_id
        ORDER BY count DESC
        LIMIT 6
    `;

  con.query(totalsSql, paymentParams, function (err, totalsRes) {
    if (err) return res.status(500).json({ message: "Server error" });

    con.query(reviewsSql, reviewParams, function (err, reviewsRes) {
      if (err) return res.status(500).json({ message: "Server error" });

      con.query(topSql, orderParams, function (err, topRes) {
        if (err) return res.status(500).json({ message: "Server error" });

        res.json({
          ...totalsRes[0],
          ...reviewsRes[0],
          top_menu: topRes,
        });
      });
    });
  });
});

// admin cooks list
app.get("/admin/cooks", function (req, res) {
  con.query(
    "SELECT cook_id, username AS name, status FROM cooks",
    function (err, results) {
      if (err)
        return res.status(500).json({ message: "Unable to fetch cooks" });
      res.json(results);
    },
  );
});

app.post("/admin/cooks", function (req, res) {
  const { cook_id, name } = req.body;

  if (!name && !cook_id)
    return res.status(400).json({ message: "Missing cook name or id" });

  const username = name || cook_id;
  const plainPass = Math.random().toString(36).slice(2, 10);
  const hash = argon2.hashSync(plainPass);
  const status = "enable";

  if (cook_id && Number.isInteger(Number(cook_id))) {
    const sql =
      "INSERT INTO cooks (cook_id, username, password, status) VALUES (?, ?, ?, ?)";
    con.query(sql, [cook_id, username, hash, status], function (err, result) {
      if (err) {
        console.error("Insert cook error", err);
        return res.status(500).json({ message: "Create cook failed" });
      }
      res.status(201).json({ message: "Cook created", password: plainPass });
    });
  } else {
    const sql =
      "INSERT INTO cooks (username, password, status) VALUES (?, ?, ?)";
    con.query(sql, [username, hash, status], function (err, result) {
      if (err) {
        console.error("Insert cook error", err);
        return res.status(500).json({ message: "Create cook failed" });
      }
      res.status(201).json({ message: "Cook created", password: plainPass });
    });
  }
});

// admin cook delete
app.delete("/admin/cooks/:id", function (req, res) {
  con.query(
    "DELETE FROM cooks WHERE cook_id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: "Delete cook failed" });
      res.json({ message: "Cook deleted" });
    },
  );
});

// admin menu list
app.get("/admin/menu", function (req, res) {
  con.query(
    "SELECT menu_id, name, price, status FROM menu",
    function (err, results) {
      if (err) return res.status(500).json({ message: "Unable to fetch menu" });
      const normalized = results.map((item) => ({
        ...item,
        cat: item.cat || "General",
        enabled: item.status === "enable",
      }));
      res.json(normalized);
    },
  );
});

// admin menu delete
app.delete("/admin/menu/:id", function (req, res) {
  con.query(
    "DELETE FROM menu WHERE menu_id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: "Delete menu failed" });
      res.json({ message: "Menu deleted" });
    },
  );
});

// admin orders list
app.get("/admin/orders", function (req, res) {
  const sql =
    `
        SELECT 
            o.order_id,
            c.table_number,
            GROUP_CONCAT(CONCAT(m.name, ' x', oi.quantity) SEPARATOR ', ') AS items,
            o.created_at,
            SUM(m.price * oi.quantity) AS total,
            MAX(oi.status) AS status
        FROM ` +
    "`order`" +
    ` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN menu m ON oi.menu_id = m.menu_id
        JOIN customer c ON o.customer_id = c.customer_id
        GROUP BY o.order_id
        ORDER BY o.created_at DESC
    `;

  con.query(sql, function (err, results) {
    if (err) return res.status(500).json({ message: "Unable to fetch orders" });
    res.json(results);
  });
});

// admin payments list
app.get("/admin/payments", function (req, res) {
  const sql = `
        SELECT p.payment_id, p.customer_id, c.table_number, p.total_price, p.paid_at
        FROM payment p
        LEFT JOIN customer c ON p.customer_id = c.customer_id
        ORDER BY p.paid_at DESC
    `;

  con.query(sql, function (err, results) {
    if (err)
      return res.status(500).json({ message: "Unable to fetch payments" });
    res.json(results);
  });
});

// admin reviews list
app.get("/admin/reviews", function (req, res) {
  con.query("SHOW COLUMNS FROM review LIKE 'rating'", function (err, cols) {
    if (err)
      return res.status(500).json({ message: "Unable to fetch reviews" });
    const hasRating = Array.isArray(cols) && cols.length > 0;
    const sql = hasRating
      ? `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at, r.rating
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `
      : `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `;

    con.query(sql, function (err2, results) {
      if (err2)
        return res.status(500).json({ message: "Unable to fetch reviews" });
      res.json(results);
    });
  });
});

app.post("/cook/register", function (req, res) {
  const { cookId, password } = req.body;

  function insertWithUsername(username) {
    const hash = argon2.hashSync(password);
    const insertSql =
      "INSERT INTO cooks (username, password, status) VALUES (?, ?, 'disable')";
    con.query(insertSql, [username, hash], function (err, result) {
      if (err) {
        console.error("Insert cook error", err);
        return res.status(500).send("Server error");
      }
      return res
        .status(201)
        .json({ message: "Account created", cookId: username });
    });
  }

  if (cookId && String(cookId).trim()) {
    const checkSql = "SELECT cook_id FROM cooks WHERE username = ?";
    con.query(checkSql, [cookId], function (err, results) {
      if (err) return res.status(500).send("Server error");
      if (results.length > 0)
        return res.status(409).json({ message: "Cook ID already exists" });
      insertWithUsername(String(cookId).trim());
    });
  } else {
    // Generate next cook id in format C001, C002, ...
    const maxSql =
      "SELECT MAX(CAST(SUBSTRING(username,2) AS UNSIGNED)) AS maxnum FROM cooks WHERE username REGEXP '^C[0-9]+'";
    con.query(maxSql, function (err, rows) {
      if (err) {
        console.error("Failed to get max cook id", err);
        // fallback: insert with timestamp-based id
        const gen = "C" + Date.now().toString().slice(-6);
        return insertWithUsername(gen);
      }
      const maxnum =
        rows && rows[0] && rows[0].maxnum ? Number(rows[0].maxnum) : 0;
      const next = maxnum + 1;
      const username = "C" + String(next).padStart(3, "0");
      insertWithUsername(username);
    });
  }
});

// ------------------------------------ end admin routes ------------------------------------

// ------------------------------------ cook routes ------------------------------------
// cook login
app.post("/cook/login", async function (req, res) {
  const { cookId, password } = req.body;
  const sql =
    "SELECT cook_id, username, password, status FROM cooks WHERE username = ?";

  con.query(sql, [cookId], async function (err, results) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid Cook ID" });
    }

    const cook = results[0];

    if (cook.status && cook.status !== "enable") {
      return res.status(403).json({ message: "Account disabled" });
    }

    try {
      const isMatch = await argon2.verify(cook.password, password);

      if (isMatch) {
        return res.status(200).json({
          cookId: cook.cook_id,
          name: cook.username,
        });
      } else {
        return res.status(401).json({ message: "Invalid Password" });
      }
    } catch (error) {
      if (password === cook.password) {
        return res.status(200).json({
          cookId: cook.cook_id,
          name: cook.username,
        });
      }
      console.error("Argon2 error:", error);
      res.status(500).json({ message: "Verification error" });
    }
  });
});

// cook info (lookup by id or username)
app.get('/cook/info', function (req, res) {
  const cookId = req.query.cookId;
  if (!cookId) return res.status(400).json({ message: 'Missing cookId' });

  const sql = 'SELECT cook_id, username FROM cooks WHERE cook_id = ? OR username = ? LIMIT 1';
  con.query(sql, [cookId, cookId], function (err, results) {
    if (err) {
      console.error('cook info error', err);
      return res.status(500).json({ message: 'DB error' });
    }
    if (!results || results.length === 0) return res.status(404).json({ message: 'Cook not found' });
    const row = results[0];
    res.json({ cookId: row.cook_id, name: row.username });
  });
});

// cook orders
app.get("/cook/orders", function (req, res) {
  const { status } = req.query;

  const sql = `
        SELECT 
            oi.order_item_id,
            oi.order_id,
            m.name AS menu_name,
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

  con.query(sql, [status || "pending"], function (err, results) {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.status(200).json(results);
  });
});

// update status cook
app.patch("/cook/order-item/:id", function (req, res) {
  const { status, cookId } = req.body;

  const validStatus = ["cooking", "serving"];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // ensure updated_at column exists
  con.query(
    "SHOW COLUMNS FROM order_item LIKE 'updated_at'",
    function (cErr, cols) {
      if (cErr) {
        console.error("Column check error", cErr);
        return res.status(500).json({ message: "Update failed" });
      }

      function doUpdate() {
        const expectedOld = status === 'cooking' ? 'pending' : (status === 'serving' ? 'cooking' : null);

        if (!expectedOld) {
          return res.status(400).json({ message: 'Invalid status transition' });
        }

        const sql = `
                UPDATE order_item 
                SET status = ?, updated_by = ?, updated_at = NOW()
                WHERE order_item_id = ? AND status = ?
            `;

        con.query(sql, [status, cookId, req.params.id, expectedOld], function (err, result) {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Update failed" });
          }

          // If no rows affected, the item's status was already changed by someone else
          if (!result || result.affectedRows === 0) {
            return res.status(409).json({ message: "Order item already claimed or status changed" });
          }

          res.status(200).json({ message: "Updated successfully" });
        });
      }

      if (!Array.isArray(cols) || cols.length === 0) {
        // add column then update
        con.query(
          "ALTER TABLE order_item ADD COLUMN updated_at DATETIME NULL",
          function (aErr) {
            if (aErr) {
              console.error("Failed to add updated_at column", aErr);
              // still attempt update without timestamp
                const expectedOld = status === 'cooking' ? 'pending' : (status === 'serving' ? 'cooking' : null);
                if (!expectedOld) {
                  return res.status(400).json({ message: 'Invalid status transition' });
                }
                const sqlNoTs = `UPDATE order_item SET status = ?, updated_by = ? WHERE order_item_id = ? AND status = ?`;
                return con.query(
                  sqlNoTs,
                  [status, cookId, req.params.id, expectedOld],
                  function (err2, result2) {
                    if (err2) {
                      console.error(err2);
                      return res.status(500).json({ message: "Update failed" });
                    }
                    if (!result2 || result2.affectedRows === 0) {
                      return res.status(409).json({ message: "Order item already claimed or status changed" });
                    }
                    res.status(200).json({ message: "Updated (no timestamp)" });
                  },
                );
            }
            doUpdate();
          },
        );
      } else {
        doUpdate();
      }
    },
  );
});

// dashboard cook
app.get("/cook/dashboard", function (req, res) {
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
  const ordersDoneSql = `
        SELECT COUNT(DISTINCT o.order_id) AS orders_done
        FROM order_item oi
        JOIN \`order\` o ON oi.order_id = o.order_id
        WHERE oi.status = 'serving'
    `;
  con.query(totalSql, function (err, totalRes) {
    if (err) return res.status(500).json({ message: "DB error" });

    con.query(topSql, function (err, topRes) {
      if (err) return res.status(500).json({ message: "DB error" });

      con.query(ordersDoneSql, function (err, ordersRes) {
        if (err) return res.status(500).json({ message: "DB error" });

        res.json({
          total_served: totalRes[0].total_served || 0,
          top_items: topRes,
          orders_done: ordersRes[0].orders_done || 0,
        });
      });
    });
  });
});

// cook reviews
app.get("/cook/reviews", function (req, res) {
  con.query("SHOW COLUMNS FROM review LIKE 'rating'", function (err, cols) {
    if (err)
      return res.status(500).json({ message: "Unable to fetch reviews" });

    const hasRating = Array.isArray(cols) && cols.length > 0;
    const sqlWithRating = `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at, r.rating
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `;
    const sql = hasRating
      ? sqlWithRating
      : `
            SELECT r.review_id, r.customer_id, c.table_number, r.comment, r.created_at
            FROM review r
            LEFT JOIN customer c ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        `;

    con.query(sql, function (err2, results) {
      if (err2)
        return res.status(500).json({ message: "Unable to fetch reviews" });
      res.json(results);
    });
  });
});

app.get("/cook/recent-served", function (req, res) {
  const sql = `
    SELECT oi.order_item_id, oi.order_id, m.name AS menu_name, oi.quantity, oi.status, o.customer_id, c.table_number, o.created_at, oi.updated_at
    FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        WHERE oi.status = 'serving'
        ORDER BY COALESCE(oi.updated_at, o.created_at) DESC
        LIMIT 8
        `;

  con.query(sql, function (err, results) {
    if (err) {
      console.error("recent-served error", err);
      return res
        .status(500)
        .json({ message: "Unable to fetch recent served items" });
    }
    res.json(results);
  });
});

// orders by hour (today)
app.get("/cook/orders-by-hour", function (req, res) {
  const sql = `
    SELECT HOUR(o.created_at) AS hr, COUNT(*) AS cnt
    FROM \`order\` o
    GROUP BY HOUR(o.created_at)
    ORDER BY hr ASC
    `;

  con.query(sql, function (err, results) {
    if (err) {
      console.error("orders-by-hour error", err);
      return res.status(500).json({ message: "Unable to fetch hourly data" });
    }
    res.json(results.map((r) => ({ hour: r.hr, count: r.cnt })));
  });
});
// ------------------------------------ end cook routes ------------------------------------

// ------------------------------------ customer routes ------------------------------------
// customer login
app.post("/customer/login", function (req, res) {
  const { tableNumber } = req.body;
  const tNum = parseInt(tableNumber, 10);

  if (Number.isNaN(tNum) || tNum <= 0) {
    return res.status(400).json({ message: "Invalid table number" });
  }

  const findSql =
    "SELECT customer_id, status FROM customer WHERE table_number = ? ORDER BY created_at DESC LIMIT 1";
  con.query(findSql, [tNum], function (err, results) {
    if (err) {
      console.error("customer/login select error", err);
      return res
        .status(500)
        .json({
          message: "Server error",
          error: err.sqlMessage || err.message,
        });
    }

    if (results.length > 0) {
      const customer = results[0];

      if (customer.status === "active") {
        return res
          .status(403)
          .json({ message: "This table is currently occupied!" });
      }

      if (customer.status === "paid" || customer.status === "inactive") {
        const updateSql =
          "UPDATE customer SET status='active', created_at=NOW() WHERE customer_id = ?";
        return con.query(updateSql, [customer.customer_id], function (err2) {
          if (err2) {
            console.error("customer/login update error", err2);
            return res
              .status(500)
              .json({
                message: "Server error",
                error: err2.sqlMessage || err2.message,
              });
          }
          return res
            .status(200)
            .json({ customerId: customer.customer_id, tableNumber: tNum });
        });
      }

      return res
        .status(200)
        .json({ customerId: customer.customer_id, tableNumber: tNum });
    }

    const insertSql =
      "INSERT INTO customer (table_number, created_at, status) VALUES (?, NOW(), 'active')";
    con.query(insertSql, [tNum], function (err2, result) {
      if (err2) {
        console.error("customer/login insert error", err2);
        return res
          .status(500)
          .json({
            message: "Server error",
            error: err2.sqlMessage || err2.message,
          });
      }
      res.status(200).json({ customerId: result.insertId, tableNumber: tNum });
    });
  });
});

// customer menu
app.get("/customer/menu-data", function (req, res) {
  const search = req.query.search || "";

  const sql = `
        SELECT * FROM menu 
        WHERE status = 'enable' 
        AND name LIKE ?
    `;

  con.query(sql, [`%${search}%`], function (err, results) {
    if (err) {
      console.error("customer/menu-data DB error:", err);
      return res
        .status(500)
        .json({ message: "DB error", error: err.sqlMessage || err.message });
    }
    res.json(results);
  });
});

// customer order
app.post("/customer/place-order", function (req, res) {
  const { customerId, items } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ message: "No items" });

  const checkSql = "SELECT status FROM customer WHERE customer_id = ?";

  con.query(checkSql, [customerId], function (err, results) {
    if (err) {
      console.error("place-order check customer error:", err);
      return res
        .status(500)
        .json({
          message: "Server error",
          error: err.sqlMessage || err.message,
        });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (results[0].status !== "active") {
      return res.status(403).json({
        message: "You already paid. Cannot order again.",
      });
    }

    const orderSql =
      "INSERT INTO `order` (customer_id, created_at) VALUES (?, NOW())";

    con.query(orderSql, [customerId], function (err, result) {
      if (err) return res.status(500).send("Order failed");

      const orderId = result.insertId;

      const itemValues = items.map((item) => [
        orderId,
        item.menu_id,
        1,
        "pending",
        0, // default to 0 meaning no cook assigned yet
      ]);

      const sql =
        "INSERT INTO order_item (order_id, menu_id, quantity, status, updated_by) VALUES ?";
      con.query(sql, [itemValues], function (err) {
        if (err) {
          console.error("place-order order_item insert error:", err);
          return res
            .status(500)
            .json({
              message: "Item insert error",
              error: err.sqlMessage || err.message,
            });
        }

        res.json({ orderId });
      });
    });
  });
});

//customer status
app.get("/customer/order-status/:orderId", function (req, res) {
  const orderId = req.params.orderId;
  const sql = `
        SELECT oi.menu_id, m.name, m.price, oi.quantity, oi.status 
        FROM order_item oi
        JOIN menu m ON oi.menu_id = m.menu_id
        WHERE oi.order_id = ?`;

  con.query(sql, [orderId], function (err, results) {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.status(200).json(results);
  });
});

//customer complete payment
app.post("/customer/complete-payment", function (req, res) {
  const { customerId, totalPrice } = req.body;

  const sql = `
        INSERT INTO payment (customer_id, total_price, paid_at)
        VALUES (?, ?, NOW())
    `;

  con.query(sql, [customerId, totalPrice], function (err) {
    if (err) return res.status(500).send("Payment error");

    con.query("UPDATE customer SET status='paid' WHERE customer_id=?", [
      customerId,
    ]);

    res.json({ message: "Paid" });
  });
});

//customer review
app.post("/customer/submit-review", function (req, res) {
  const { customerId, comment, rating } = req.body;
  function insertWithoutRating() {
    const sql =
      "INSERT INTO review (customer_id, comment, created_at) VALUES (?, ?, NOW())";
    con.query(sql, [customerId, comment], function (err, result) {
      if (err) return res.status(500).send("Review Error");
      res.status(201).json({ message: "Review saved" });
    });
  }

  if (typeof rating === "number") {
    const sql =
      "INSERT INTO review (customer_id, comment, rating, created_at) VALUES (?, ?, ?, NOW())";
    con.query(sql, [customerId, comment, rating], function (err, result) {
      if (!err) return res.status(201).json({ message: "Review saved" });
      const isUnknownCol =
        err && (err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1054);
      if (isUnknownCol) {
        con.query(
          "ALTER TABLE review ADD COLUMN rating TINYINT NULL",
          function (aerr) {
            if (aerr) {
              console.error("Failed to add rating column", aerr);
              return insertWithoutRating();
            }
            con.query(sql, [customerId, comment, rating], function (err2) {
              if (err2) return insertWithoutRating();
              res.status(201).json({ message: "Review saved" });
            });
          },
        );
        return;
      }
      console.error("Review insert error", err);
      return insertWithoutRating();
    });
  } else {
    insertWithoutRating();
  }
});

// history payment customer
app.get("/customer/payment-history/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const sql =
    "SELECT total_price, paid_at FROM payment WHERE customer_id = ? ORDER BY paid_at DESC LIMIT 1";

  con.query(sql, [customerId], function (err, results) {
    if (err) return res.status(500).send("Database error");
    res.status(200).json(results[0] || {});
  });
});

// history review customer
app.get("/customer/review-history/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const sql =
    "SELECT comment, created_at FROM review WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1";

  con.query(sql, [customerId], function (err, results) {
    if (err) return res.status(500).send("Database error");
    res.status(200).json(results[0] || {});
  });
});
// leave customer
app.post("/customer/logout/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const sql = "UPDATE customer SET status = 'paid' WHERE customer_id = ?";

  con.query(sql, [customerId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Logout failed");
    }
    res.status(200).json({ message: "Session closed" });
  });
});
// ------------------------------------ end customer routes ------------------------------------

app.listen(3000, function () {
  console.log("Server is running on port 3000");
  console.log("http://localhost:3000");
});
