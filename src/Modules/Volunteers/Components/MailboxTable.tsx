import React, { useState } from "react";
import { useAllMailboxRequests } from "../Services/VolunteersServices";

interface MailboxItem {
  Id_mailbox: number;
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  Created_at?: string;
  Registration_date?: string;
  Updated_at?: string;

  // enlaces individuales que vienen en columnas separadas en la BD
  Document1?: string | null;
  Document2?: string | null;
  Document3?: string | null;

  volunteer?: {
    id_volunteer: number;
    first_name: string;
    second_name?: string;
    first_lastname: string;
    second_lastname?: string;
    email: string;
  };
}

function buildFullName(v?: MailboxItem["volunteer"]) {
  if (!v) return "—";
  const parts = [
    v.first_name || "",
    v.second_name || "",
    v.first_lastname || "",
    v.second_lastname || "",
  ]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

function formatFecha(item: MailboxItem) {
  const raw =
    item.Created_at ||
    item.Registration_date ||
    item.Updated_at ||
    "";

  if (!raw) return "—";

  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MailboxTable = () => {
  const { data: mailboxList = [], isLoading, isError } = useAllMailboxRequests();
  const [selectedItem, setSelectedItem] = useState<MailboxItem | null>(null);

  if (isLoading) {
    return (
      <div style={{ padding: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>
        Cargando buzón...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: "1rem",
          color: "#dc2626",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}
      >
        Error al cargar el buzón.
      </div>
    );
  }

  if (!mailboxList.length) {
    return (
      <div
        style={{
          padding: "2rem",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          backgroundColor: "#fff",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "0.9rem",
          boxShadow:
            "0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          📬
        </div>
        <div
          style={{
            fontWeight: 600,
            marginBottom: "0.25rem",
            color: "#111827",
          }}
        >
          No hay solicitudes en el buzón
        </div>
        <div>Cuando los voluntarios envíen solicitudes, aparecerán aquí.</div>
      </div>
    );
  }

  return (
    <>
      {/* Tabla */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          backgroundColor: "#fff",
          overflowX: "auto",
          boxShadow:
            "0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.04)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "900px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Voluntario
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Organización
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Asunto
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Fecha
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {mailboxList.map((item: MailboxItem) => {
              const fullName = buildFullName(item.volunteer);
              const email = item.volunteer?.email || "";
              const fecha = formatFecha(item);

              return (
                <tr
                  key={item.Id_mailbox}
                  style={{
                    color: "#111827",
                    fontSize: "0.875rem",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* # */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                    }}
                  >
                    #{item.Id_mailbox}
                  </td>

                  {/* Voluntario + email */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      lineHeight: 1.4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#111827",
                        marginBottom: email ? "0.25rem" : 0,
                      }}
                    >
                      {fullName}
                    </div>
                    {email && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={email}
                      >
                        {email}
                      </div>
                    )}
                  </td>

                  {/* Organización */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#374151",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.Organization || "—"}
                  >
                    {item.Organization || "—"}
                  </td>

                  {/* Asunto */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#374151",
                      maxWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.Affair || "—"}
                  >
                    {item.Affair || "—"}
                  </td>

                  {/* Fecha */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fecha}
                  </td>

                  {/* Acción */}
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e5e7eb",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        color: "#111827",
                        borderRadius: "0.375rem",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        padding: "0.5rem 0.75rem",
                        lineHeight: 1.2,
                        cursor: "pointer",
                        boxShadow:
                          "0 1px 2px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          "#fff";
                      }}
                    >
                      {/* icono ojo */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal detalle */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              color: "#111827",
              lineHeight: 1.5,
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "1rem",
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "#111827",
              }}
            >
              Solicitud #{selectedItem.Id_mailbox}
            </h3>

            <p style={{ margin: "0 0 .5rem" }}>
              <strong>Voluntario:</strong>{" "}
              {buildFullName(selectedItem.volunteer)}
            </p>

            <p style={{ margin: "0 0 .5rem" }}>
              <strong>Organización:</strong>{" "}
              {selectedItem.Organization || "—"}
            </p>

            <p style={{ margin: "0 0 .5rem" }}>
              <strong>Asunto:</strong> {selectedItem.Affair || "—"}
            </p>

            <p style={{ margin: "0 0 .5rem", whiteSpace: "pre-wrap" }}>
              <strong>Descripción:</strong>{" "}
              {selectedItem.Description || "—"}
            </p>

            <p style={{ margin: "0 0 .5rem" }}>
              <strong>Horas:</strong>{" "}
              {selectedItem.Hour_volunteer ?? "—"}
            </p>

            <p style={{ margin: "0 0 .5rem" }}>
              <strong>Fecha:</strong> {formatFecha(selectedItem)}
            </p>

            {/* Documentos: Documento #1, #2, #3 */}
            {(selectedItem.Document1 ||
              selectedItem.Document2 ||
              selectedItem.Document3) && (
              <div style={{ margin: "1rem 0 .5rem" }}>
                <strong>Documentos:</strong>
                <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
                  {selectedItem.Document1 && (
                    <li
                      style={{
                        fontSize: "0.9rem",
                        wordBreak: "break-word",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Documento #1: </span>
                      <a
                        href={selectedItem.Document1}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2563eb",
                          textDecoration: "underline",
                        }}
                      >
                        {selectedItem.Document1}
                      </a>
                    </li>
                  )}

                  {selectedItem.Document2 && (
                    <li
                      style={{
                        fontSize: "0.9rem",
                        wordBreak: "break-word",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Documento #2: </span>
                      <a
                        href={selectedItem.Document2}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2563eb",
                          textDecoration: "underline",
                        }}
                      >
                        {selectedItem.Document2}
                      </a>
                    </li>
                  )}

                  {selectedItem.Document3 && (
                    <li
                      style={{
                        fontSize: "0.9rem",
                        wordBreak: "break-word",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Documento #3: </span>
                      <a
                        href={selectedItem.Document3}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2563eb",
                          textDecoration: "underline",
                        }}
                      >
                        {selectedItem.Document3}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  backgroundColor: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#4b5563";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#6b7280";
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MailboxTable;
