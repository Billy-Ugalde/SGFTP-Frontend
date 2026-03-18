import styles from "../styles/LegalPages.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Aviso de Privacidad</h1>
        <p className={styles.text}>
          Para algunas funcionalidades, el sitio web de Fundación Tamarindo Park solicita información al usuario a través de formularios de contacto. Al completar dichos formularios, el usuario otorga su consentimiento para que los datos que suministre sean utilizados con la finalidad indicada en el mismo formulario, tales como gestionar solicitudes, brindar información sobre proyectos, actividades, iniciativas de la Fundación entre otros.
        </p>
        <p className={styles.text}>
          La Fundación Tamarindo Park, organización sin fines de lucro, se compromete a tratar los datos personales suministrados por los usuarios conforme a lo establecido en la legislación costarricense en materia de protección de datos personales, particularmente la Ley N.° 8968, Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales.
        </p>
        <p className={styles.text}>
          Los datos personales proporcionados por el usuario serán utilizados únicamente para los fines indicados y no serán vendidos, cedidos ni divulgados a terceros sin el consentimiento del titular, salvo en los casos previstos por la legislación aplicable.
        </p>
        <p className={styles.text}>
          Podría mostrarse públicamente información aportadas por los usuarios en algún momento. No obstante, la Fundación Tamarindo Park procurará resguardar la confidencialidad de otros datos personales como direcciones de correo electrónico u otra información de contacto personal.
        </p>
        <p className={styles.text}>
          Asimismo, este sitio web puede utilizar cookies u otras tecnologías similares para almacenar información relacionada con la sesión del usuario o sus preferencias de navegación. Estos datos se utilizan únicamente con el objetivo de mejorar la experiencia del usuario dentro del sitio web. El usuario puede configurar su navegador para aceptar o rechazar el uso de cookies.
        </p>
        <p className={styles.text}>
          De conformidad con la Ley N.° 8968, los usuarios podrán ejercer sus derechos de acceso, rectificación o eliminación de sus datos personales mediante una solicitud dirigida a la Fundación Tamarindo Park a través del correo electrónico info@tamarindoparkfoundation.com
        </p>
        <p className={styles.text}>
          La Fundación Tamarindo Park se reserva el derecho de actualizar o modificar la presente política de privacidad cuando sea necesario, con el fin de adaptarla a cambios legales, técnicos o de funcionamiento del sitio web.
        </p>
      </div>
    </div>
  );
}
