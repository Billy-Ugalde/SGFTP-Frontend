import { useState } from "react";
import { useAllMailboxRequests } from "../Services/VolunteersServices";
import "../Styles/MailboxTable.css";

interface MailboxItem {
  Id_mailbox: number;
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  Created_at?: string;
  Registration_date?: string;
  Updated_at?: string;

  Document1?: string | null;
  Document2?: string | null;
  Document3?: string | null;

  volunteer?: {
    id_volunteer: number;
    first_name?: string;
    second_name?: string;
    first_lastname?: string;
    second_lastname?: string;
    email?: string;
    person?: {
      first_name?: string;
      second_name?: string;
      first_lastname?: string;
      second_lastname?: string;
      email?: string;
    };
  };
}

function buildFullName(v?: MailboxItem["volunteer"]) {
  if (!v) return "—";
  const src = v.person ?? v;
  const parts = [
    src.first_name || "",
    src.second_name || "",
    src.first_lastname || "",
    src.second_lastname || "",
  ]
    .map((p) => p?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(" ") : "—";
}

function getVolunteerEmail(v?: MailboxItem["volunteer"]) {
  if (!v) return "—";
  return v.person?.email || v.email || "—";
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
      <div className="mailbox-table__loading">
        Cargando buzón...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mailbox-table__error">
        Error al cargar el buzón.
      </div>
    );
  }

  if (!mailboxList.length) {
    return (
      <div className="mailbox-table__empty">
        <div
          className="mailbox-table__empty-emoji"
          aria-hidden="true"
        >
          📬
        </div>
        <div className="mailbox-table__empty-title">
          No hay solicitudes en el buzón
        </div>
        <div>Cuando los voluntarios envíen solicitudes, aparecerán aquí.</div>
      </div>
    );
  }

  return (
    <>
      {/* Tabla */}
      <div className="mailbox-table__wrapper">
        <table className="mailbox-table__table">
          <thead>
            <tr className="mailbox-table__thead-row">
              <th className="mailbox-table__th">Voluntario</th>
              <th className="mailbox-table__th">Organización</th>
              <th className="mailbox-table__th">Asunto</th>
              <th className="mailbox-table__th">Fecha</th>
              <th className="mailbox-table__th">Acción</th>
            </tr>
          </thead>
          <tbody>
            {mailboxList.map((item: MailboxItem) => {
              const fullName = buildFullName(item.volunteer);
              const email = getVolunteerEmail(item.volunteer);
              const fecha = formatFecha(item);

              return (
                <tr
                  key={item.Id_mailbox}
                  className="mailbox-table__row"
                >
                  {/* Voluntario + email */}
                  <td className="mailbox-table__cell">
                    <div className="mailbox-table__volunteer-name">
                      {fullName}
                    </div>
                    {email !== "—" && (
                      <div
                        className="mailbox-table__volunteer-email"
                        title={email}
                      >
                        {email}
                      </div>
                    )}
                  </td>

                  {/* Organización */}
                  <td
                    className="mailbox-table__cell mailbox-table__cell--org"
                    title={item.Organization || "—"}
                  >
                    {item.Organization || "—"}
                  </td>

                  {/* Asunto */}
                  <td
                    className="mailbox-table__cell mailbox-table__cell--affair"
                    title={item.Affair || "—"}
                  >
                    {item.Affair || "—"}
                  </td>

                  {/* Fecha */}
                  <td className="mailbox-table__cell mailbox-table__cell--muted">
                    {fecha}
                  </td>

                  {/* Acción */}
                  <td className="mailbox-table__cell">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="mailbox-table__view-btn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        className="mailbox-table__view-btn-icon"
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
        <div className="mailbox-modal__overlay">
          <div className="mailbox-modal__card">
            {/* Header del modal */}
            <div className="mailbox-modal__header">
              <div className="mailbox-modal__icon">📬</div>
              <div className="mailbox-modal__header-main">
                <div className="mailbox-modal__title">
                  Solicitud #{selectedItem.Id_mailbox}
                </div>
                <div className="mailbox-modal__subtitle">
                  {formatFecha(selectedItem)}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="mailbox-modal__close-btn"
              >
                ✕
              </button>
            </div>

            {/* Body del modal */}
            <div className="mailbox-modal__body">
              {/* Voluntario + email */}
              <div className="mailbox-modal__section">
                <div className="mailbox-modal__label">Voluntario</div>
                <div className="mailbox-modal__value-strong">
                  {buildFullName(selectedItem.volunteer)}
                </div>
                <div className="mailbox-modal__value-sub">
                  {getVolunteerEmail(selectedItem.volunteer)}
                </div>
              </div>

              {/* Organización */}
              <div className="mailbox-modal__section">
                <div className="mailbox-modal__label">Organización</div>
                <div className="mailbox-modal__value-normal">
                  {selectedItem.Organization || "—"}
                </div>
              </div>

              {/* Asunto */}
              <div className="mailbox-modal__section">
                <div className="mailbox-modal__label">Asunto</div>
                <div className="mailbox-modal__value-normal">
                  {selectedItem.Affair || "—"}
                </div>
              </div>

              {/* Descripción */}
              <div className="mailbox-modal__section">
                <div className="mailbox-modal__label">Descripción</div>
                <div className="mailbox-modal__desc-box">
                  {selectedItem.Description || "—"}
                </div>
              </div>

              {/* Horas de voluntariado */}
              <div className="mailbox-modal__section">
                <div className="mailbox-modal__label">Horas Registradas</div>
                <div className="mailbox-modal__value-normal">
                  {selectedItem.Hour_volunteer ?? "—"}
                </div>
              </div>

              {/* Documentos */}
              {(selectedItem.Document1 ||
                selectedItem.Document2 ||
                selectedItem.Document3) && (
                <div className="mailbox-modal__docs-listwrap">
                  <div className="mailbox-modal__docs-label">Documentos</div>
                  <ul className="mailbox-modal__docs-list">
                    {selectedItem.Document1 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">
                          Documento #1:{" "}
                        </span>
                        <a
                          href={selectedItem.Document1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          {selectedItem.Document1}
                        </a>
                      </li>
                    )}

                    {selectedItem.Document2 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">
                          Documento #2:{" "}
                        </span>
                        <a
                          href={selectedItem.Document2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          {selectedItem.Document2}
                        </a>
                      </li>
                    )}

                    {selectedItem.Document3 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">
                          Documento #3:{" "}
                        </span>
                        <a
                          href={selectedItem.Document3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          {selectedItem.Document3}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="mailbox-modal__footer">
              <button
                onClick={() => setSelectedItem(null)}
                className="mailbox-modal__close-primary"
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
