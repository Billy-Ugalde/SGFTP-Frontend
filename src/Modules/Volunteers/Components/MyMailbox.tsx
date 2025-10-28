import "../Styles/VolunteerActivities.css";

export default function MyMailbox() {
  return (
    <div className="volunteer-activities">
      <div className="volunteer-activities__header">
        <h3 className="volunteer-activities__title">Buzón de Mensajes</h3>
      </div>

      <div className="volunteer-activities__empty">
        <div className="volunteer-activities__empty-icon">📬</div>
        <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Funcionalidad en desarrollo</p>
        <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          Pronto podrás enviar mensajes y documentos a la organización desde aquí.
        </p>
      </div>
    </div>
  );
}
