// Validación de datos
export const regex = /^[a-zA-Z0-9@.\s]+$/;

export const validateContact = (
  nombres: string,
  telefono: string,
  correo: string,
  pais: string
): string | null => {
  if (!nombres.trim()) return "El campo Nombres es obligatorio";
  if (!telefono.trim()) return "El campo Teléfono es obligatorio";
  if (!correo.trim()) return "El campo Correo es obligatorio";
  if (!pais.trim()) return "El campo País es obligatorio";

  if (!regex.test(nombres)) return "Nombres: No se permiten caracteres especiales";
  if (!regex.test(telefono)) return "Teléfono: No se permiten caracteres especiales";
  if (!regex.test(correo)) return "Correo: No se permiten caracteres especiales";
  if (!regex.test(pais)) return "País: No se permiten caracteres especiales";

  return null;
};

export const API_BASE_URL = "http://localhost:3000";
export const CONTACTS_ENDPOINT = `${API_BASE_URL}/contacts`;
