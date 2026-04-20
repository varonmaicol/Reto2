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

const initialForm: CreateContactDTO = {
  nombres: "",
  telefono: "",
  correo: "",
  pais: "",
};

const textRegex = /^[a-zA-Z0-9@.\s]+$/;

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<CreateContactDTO>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Error desconocido";

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    clearMessages();
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const loadContacts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessages();
  };

  const validateForm = () => {
    const { nombres, telefono, correo, pais } = form;

    if (!nombres.trim()) return "El campo Nombres es obligatorio";
    if (!telefono.trim()) return "El campo Teléfono es obligatorio";
    if (!correo.trim()) return "El campo Correo es obligatorio";
    if (!pais.trim()) return "El campo País es obligatorio";

    if (!textRegex.test(nombres))
      return "Nombres: No se permiten caracteres especiales";

    if (!textRegex.test(telefono))
      return "Teléfono: No se permiten caracteres especiales";

    if (!textRegex.test(correo))
      return "Correo: No se permiten caracteres especiales";

    if (!textRegex.test(pais))
      return "País: No se permiten caracteres especiales";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      if (editingId !== null) {
        await updateContact(editingId, form);
        showSuccess("Contacto actualizado correctamente");
      } else {
        await createContact(form);
        showSuccess("Contacto creado correctamente");
      }

      resetForm();
      await loadContacts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setForm({
      nombres: contact.nombres,
      telefono: contact.telefono,
      correo: contact.correo,
      pais: contact.pais,
    });

    setEditingId(contact.id);
    clearMessages();
  };

  const handleDelete = async (id: number, nombre: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el contacto "${nombre}"?`,
    );

    if (!confirmed) return;

    clearMessages();

    try {
      await deleteContact(id);
      showSuccess("Contacto eliminado correctamente");
      await loadContacts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Contactos</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form
        onSubmit={handleSubmit}
        className={`form ${editingId !== null ? "editing" : ""}`}
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
          {submitting
            ? "Procesando..."
            : editingId !== null
              ? "Actualizar"
              : "Crear"}
        </button>

        {editingId !== null && (
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
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.nombres}</td>
                <td>{contact.telefono}</td>
                <td>{contact.correo}</td>
                <td>{contact.pais}</td>

                <td className="actions">
                  <button
                    className="btn-edit"
                    title="Editar contacto"
                    onClick={() => handleEdit(contact)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-delete"
                    title="Eliminar contacto"
                    onClick={() => handleDelete(contact.id, contact.nombres)}
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
