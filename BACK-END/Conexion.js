const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "contactos",
});

db.connect((err) => {
  if (err) {
    console.log("Error a la conexion de base de datos", err);
  } else {
    console.log("Conexion de la base de datos exitosa");
  }
});

module.exports = db;
