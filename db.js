const mysql = require("mysql2");

const con = mysql.createConnection({
    host: 'localhost',
    port: 3306, // adjust port if used differently
    user: 'root',
    password: '',
    database: 'web_project'
});

con.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
        process.exit(1);
    }
    console.log('MySQL connected: web_project');
});

module.exports = con;