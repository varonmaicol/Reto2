const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "contactos",
});

db.connect((err) => {
  if (err) {
    console.log("Error en la conexion a la base de datos", err);
  } else {
    console.log("Conexion a la base de datos exitosa");
  }
});

module.exports = db;
