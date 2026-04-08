import { CONTACTS_ENDPOINT } from "../utils";

export interface Contact {
  id: number;
  nombres: string;
  telefono: string;
  correo: string;
  pais: string;
}

export interface CreateContactDTO {
  nombres: string;
  telefono: string;
  correo: string;
  pais: string;
}

// Obtener todos los contactos
export const fetchContacts = async (): Promise<Contact[]> => {
  const res = await fetch(CONTACTS_ENDPOINT);
  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudo obtener los contactos`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// Crear nuevo contacto
export const createContact = async (contactData: CreateContactDTO): Promise<void> => {
  const res = await fetch(CONTACTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || `Error ${res.status} al crear contacto`);
  }
};

// Actualizar contacto
export const updateContact = async (
  id: number,
  contactData: CreateContactDTO
): Promise<void> => {
  const res = await fetch(`${CONTACTS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || `Error ${res.status} al actualizar contacto`);
  }
};

// Eliminar contacto
export const deleteContact = async (id: number): Promise<void> => {
  const res = await fetch(`${CONTACTS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || `Error ${res.status} al eliminar contacto`);
  }
};
