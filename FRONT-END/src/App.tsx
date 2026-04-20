import { useEffect, useState } from "react";
import "./App.css";
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type CreateContactDTO,
} from "./services/contactService";

interface FormData extends CreateContactDTO {}

const regex = /^[a-zA-Z0-9@.\s]+$/;

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<FormData>({
    nombres: "",
    telefono: "",
    correo: "",
    pais: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!form.nombres.trim()) {
      return "El campo Nombres es obligatorio";
    }
    if (!form.telefono.trim()) {
      return "El campo Teléfono es obligatorio";
    }
    if (!form.correo.trim()) {
      return "El campo Correo es obligatorio";
    }
    if (!form.pais.trim()) {
      return "El campo País es obligatorio";
    }

    if (!regex.test(form.nombres)) {
      return "Nombres: No se permiten caracteres especiales";
    }
    if (!regex.test(form.telefono)) {
      return "Teléfono: No se permiten caracteres especiales";
    }
    if (!regex.test(form.correo)) {
      return "Correo: No se permiten caracteres especiales";
    }
    if (!regex.test(form.pais)) {
      return "País: No se permiten caracteres especiales";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateContact(editingId, form);
      } else {
        await createContact(form);
      }

      const successMessage = editingId
        ? "Contacto actualizado correctamente"
        : "Contacto creado correctamente";

      setSuccess(successMessage);
      resetForm();
      await getContacts();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setForm(contact);
    setEditingId(contact.id);
  };

  const handleDelete = async (id: number, nombre: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el contacto "${nombre}"?`,
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await deleteContact(id);

      setSuccess("Contacto eliminado correctamente");
      await getContacts();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setForm({ nombres: "", telefono: "", correo: "", pais: "" });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container">
      <h1>Gestión de Contactos</h1>

      {error && <div className="error">{error}</div>}
      {success && (
        <div
          style={{
            color: "green",
            fontWeight: "bold",
            padding: "15px",
            background: "#e8f5e9",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "2px solid #4caf50",
            textAlign: "center",
          }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="form"
        style={editingId ? { borderLeft: "5px solid #0284c7" } : {}}
      >
        <input
          name="nombres"
          placeholder="Nombres"
          value={form.nombres}
          onChange={handleChange}
          disabled={submitting}
          required
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          disabled={submitting}
          required
        />
        <input
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handleChange}
          disabled={submitting}
          required
        />
        <input
          name="pais"
          placeholder="País"
          value={form.pais}
          onChange={handleChange}
          disabled={submitting}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Procesando..." : editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} disabled={submitting}>
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <p>Cargando contactos...</p>
      ) : contacts.length === 0 ? (
        <p>No hay contactos. ¡Crea uno nuevo!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.nombres}</td>
                <td>{c.telefono}</td>
                <td>{c.correo}</td>
                <td>{c.pais}</td>
                <td
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => handleEdit(c)}
                    title="Editar contacto"
                    style={{
                      background: "#0284c7",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.nombres)}
                    title="Eliminar contacto"
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default App;
