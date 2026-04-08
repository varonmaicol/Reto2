const express = require("express");
const router = express.Router();
const db = require("./Conexion");
const axios = require("axios");

const regex = /^[a-zA-Z0-9@.\s]+$/;

const ORACLE_URL =
  "https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts";

const AUTH = {
  auth: {
    username: "ICXCandidate",
    password: "Welcome2024",
  },
};

const validate = ({ nombres, telefono, correo, pais }) => {
  return (
    nombres &&
    telefono &&
    correo &&
    pais &&
    regex.test(nombres) &&
    regex.test(telefono) &&
    regex.test(correo) &&
    regex.test(pais)
  );
};

router.get("/contacts", (req, res) => {
  db.query("SELECT * FROM oracle", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post("/contacts", (req, res) => {
  const data = req.body;

  if (!validate(data)) {
    return res.status(400).json({ message: "Datos inválidos" });
  }

  const { nombres, telefono, correo, pais } = data;

  db.query(
    "INSERT INTO oracle (nombres, telefono, correo, pais) VALUES (?, ?, ?, ?)",
    [nombres, telefono, correo, pais],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Contacto creado" });
    },
  );
});

router.put("/contacts/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!validate(data)) {
    return res.status(400).json({ message: "Datos inválidos" });
  }

  const { nombres, telefono, correo, pais } = data;

  db.query(
    "UPDATE oracle SET nombres=?, telefono=?, correo=?, pais=? WHERE id=?",
    [nombres, telefono, correo, pais, id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Contacto no encontrado" });
      }

      res.json({ message: "Contacto actualizado" });
    },
  );
});

router.delete("/contacts/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM oracle WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contacto no encontrado" });
    }

    res.json({ message: "Contacto eliminado" });
  });
});

router.get("/oracle/contacts", async (req, res) => {
  try {
    const response = await axios.get(ORACLE_URL, AUTH);
    const data = response.data.items || [];

    data.forEach((c) => {
      db.query(
        "INSERT INTO oracle (nombres, telefono, correo, pais) VALUES (?, ?, ?, ?)",
        [
          c.name?.first || "Sin nombre",
          c.phones?.[0]?.number || "000",
          c.emails?.[0]?.address || "sincorreo@test.com",
          "N/A",
        ],
      );
    });

    res.json({ source: "oracle", data });
  } catch (error) {
    db.query("SELECT * FROM oracle", (err, results) => {
      if (err) return res.status(500).json(err);
      res.json({ source: "local", data: results });
    });
  }
});

router.post("/oracle/contacts", async (req, res) => {
  try {
    const response = await axios.post(ORACLE_URL, req.body, AUTH);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Error al crear en Oracle" });
  }
});

router.put("/oracle/contacts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.patch(`${ORACLE_URL}/${id}`, req.body, AUTH);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Error al actualizar en Oracle" });
  }
});

router.delete("/oracle/contacts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await axios.delete(`${ORACLE_URL}/${id}`, AUTH);
    res.json({ message: "Contacto eliminado en Oracle" });
  } catch {
    res.status(500).json({ message: "Error al eliminar en Oracle" });
  }
});

module.exports = router;
