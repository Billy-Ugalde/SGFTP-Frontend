import { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";
import { EmptyState } from '../../Shared/components';
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

  /* ── Escape para cerrar modal ── */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedItem) setSelectedItem(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedItem]);

  /* ── Bloquear scroll del body cuando el modal está abierto ── */
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedItem]);

  if (isLoading) {
    return <div className="mailbox-table__loading">Cargando buzón...</div>;
  }

  if (isError) {
    return <div className="mailbox-table__error">Error al cargar el buzón.</div>;
  }

  if (!mailboxList.length) {
    return <EmptyState recurso="solicitudes" genero="f" />;
  }

  const hasDocuments = (item: MailboxItem) =>
    !!(item.Document1 || item.Document2 || item.Document3);

  return (
    <>
      {/* ── Tabla ── */}
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
                <tr key={item.Id_mailbox} className="mailbox-table__row">
                  {/* Voluntario + email */}
                  <td className="mailbox-table__cell">
                    <div className="mailbox-table__volunteer-name">{fullName}</div>
                    {email !== "—" && (
                      <div className="mailbox-table__volunteer-email" title={email}>
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
                        className="mailbox-table__view-btn-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modal de detalle (administrativo) ── */}
      {selectedItem && (
        <div
          className="mailbox-modal__overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="mailbox-modal__card" role="dialog" aria-modal="true">

            {/* Header */}
            <div className="mailbox-modal__header">
              <div className="mailbox-modal__icon">
                <Mail size={20} />
              </div>
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
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="mailbox-modal__body">

              {/* ── Voluntario — ancho completo ── */}
              <div className="mailbox-modal__volunteer-section">
                <div className="mailbox-modal__label">Voluntario</div>
                <div className="mailbox-modal__value-strong">
                  {buildFullName(selectedItem.volunteer)}
                </div>
                {getVolunteerEmail(selectedItem.volunteer) !== "—" && (
                  <div className="mailbox-modal__value-sub">
                    {getVolunteerEmail(selectedItem.volunteer)}
                  </div>
                )}
              </div>

              {/* ── Grid dos columnas ── */}
              <div className="mailbox-modal__body-grid">

                {/* Columna izquierda: Organización · Asunto · Documentos */}
                <div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Organización</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedItem.Organization || "—"}
                    </div>
                  </div>

                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Asunto</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedItem.Affair || "—"}
                    </div>
                  </div>

                  {hasDocuments(selectedItem) && (
                    <div className="mailbox-modal__docs-listwrap">
                      <div className="mailbox-modal__docs-label">Documentos Adjuntos</div>
                      <ul className="mailbox-modal__docs-list">
                        {selectedItem.Document1 && (
                          <li className="mailbox-modal__docs-item">
                            <span className="mailbox-modal__docs-item-label">Documento #1: </span>
                            <a
                              href={selectedItem.Document1}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mailbox-modal__link"
                            >
                              Ver documento
                            </a>
                          </li>
                        )}
                        {selectedItem.Document2 && (
                          <li className="mailbox-modal__docs-item">
                            <span className="mailbox-modal__docs-item-label">Documento #2: </span>
                            <a
                              href={selectedItem.Document2}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mailbox-modal__link"
                            >
                              Ver documento
                            </a>
                          </li>
                        )}
                        {selectedItem.Document3 && (
                          <li className="mailbox-modal__docs-item">
                            <span className="mailbox-modal__docs-item-label">Documento #3: </span>
                            <a
                              href={selectedItem.Document3}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mailbox-modal__link"
                            >
                              Ver documento
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Descripción · Horas */}
                <div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Descripción</div>
                    <div className="mailbox-modal__desc-box">
                      {selectedItem.Description || "—"}
                    </div>
                  </div>

                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Horas de Voluntariado</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedItem.Hour_volunteer ?? "—"}
                    </div>
                  </div>
                </div>

              </div>{/* /body-grid */}
            </div>{/* /body */}

            {/* Footer */}
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
