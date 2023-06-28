const mysql = require('mysql')
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "escritorio_projeto_lattes"
})

module.exports = db;