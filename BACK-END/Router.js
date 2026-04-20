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

router.get("/contacts", async (req, res) => {
  try {
    const response = await axios.get(ORACLE_URL, AUTH);
    const data = response.data.items || [];
    const mappedData = data.map((c) => ({
      id: c.id,
      nombres: c.name?.first || c.lookupName || "Sin nombre",
      telefono: c.phones?.items?.[0]?.number || "000",
      correo: c.emails?.items?.[0]?.address || "sincorreo@test.com",
      pais: c.address?.country || "N/A",
    }));
    res.json(mappedData);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener contactos de Oracle" });
  }
});

router.post("/contacts", async (req, res) => {
  const data = req.body;

  if (!validate(data)) {
    return res.status(400).json({ message: "Datos inválidos" });
  }

  try {
    const oracleData = {
      name: { first: data.nombres },
      phones: { items: [{ number: data.telefono }] },
      emails: { items: [{ address: data.correo }] },
      address: { country: data.pais },
    };
    const response = await axios.post(ORACLE_URL, oracleData, AUTH);
    res.json({ message: "Contacto creado en Oracle", data: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error al crear contacto en Oracle" });
  }
});

router.put("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!validate(data)) {
    return res.status(400).json({ message: "Datos inválidos" });
  }

  try {
    const oracleData = {
      name: { first: data.nombres },
      phones: { items: [{ number: data.telefono }] },
      emails: { items: [{ address: data.correo }] },
      address: { country: data.pais },
    };
    const response = await axios.patch(`${ORACLE_URL}/${id}`, oracleData, AUTH);
    res.json({
      message: "Contacto actualizado en Oracle",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar contacto en Oracle" });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await axios.delete(`${ORACLE_URL}/${id}`, AUTH);
    res.json({ message: "Contacto eliminado en Oracle" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar contacto en Oracle" });
  }
});

router.get("/oracle/contacts", async (req, res) => {
  try {
    const response = await axios.get(ORACLE_URL, AUTH);
    console.log("Datos obtenidos de Oracle:", response.data);

    const data = response.data.items || [];

    data.forEach((c) => {
      db.query(
        "INSERT INTO oracle (nombres, telefono, correo, pais) VALUES (?, ?, ?, ?)",
        [
          c.name?.first || c.lookupName || "Sin nombre",
          c.phones?.items?.[0]?.number || "000",
          c.emails?.items?.[0]?.address || "sincorreo@test.com",
          c.address?.country || "N/A",
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
