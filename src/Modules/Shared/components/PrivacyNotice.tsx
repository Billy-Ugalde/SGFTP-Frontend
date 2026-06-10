import { useState } from 'react';
import styles from '../styles/LegalPages.module.css';

const content = {
  es: {
    title: 'Aviso de Privacidad',
    paragraphs: [
      'Para algunas funcionalidades, el sitio web de Fundación Tamarindo Park solicita información al usuario a través de formularios de contacto. Al completar dichos formularios, el usuario otorga su consentimiento para que los datos que suministre sean utilizados con la finalidad indicada en el mismo formulario, tales como gestionar solicitudes, brindar información sobre proyectos, actividades, iniciativas de la Fundación entre otros.',
      'La Fundación Tamarindo Park, organización sin fines de lucro, se compromete a tratar los datos personales suministrados por los usuarios conforme a lo establecido en la legislación costarricense en materia de protección de datos personales, particularmente la Ley N.° 8968, Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales.',
      'Los datos personales proporcionados por el usuario serán utilizados únicamente para los fines indicados y no serán vendidos, cedidos ni divulgados a terceros sin el consentimiento del titular, salvo en los casos previstos por la legislación aplicable.',
      'Podría mostrarse públicamente información aportadas por los usuarios en algún momento. No obstante, la Fundación Tamarindo Park procurará resguardar la confidencialidad de otros datos personales como direcciones de correo electrónico u otra información de contacto personal.',
      'Asimismo, este sitio web puede utilizar cookies u otras tecnologías similares para almacenar información relacionada con la sesión del usuario o sus preferencias de navegación. Estos datos se utilizan únicamente con el objetivo de mejorar la experiencia del usuario dentro del sitio web. El usuario puede configurar su navegador para aceptar o rechazar el uso de cookies.',
      'De conformidad con la Ley N.° 8968, los usuarios podrán ejercer sus derechos de acceso, rectificación o eliminación de sus datos personales mediante una solicitud dirigida a la Fundación Tamarindo Park a través del correo electrónico info@tamarindoparkfoundation.com',
      'La Fundación Tamarindo Park se reserva el derecho de actualizar o modificar la presente política de privacidad cuando sea necesario, con el fin de adaptarla a cambios legales, técnicos o de funcionamiento del sitio web.',
    ],
  },
  en: {
    title: 'Privacy Notice',
    paragraphs: [
      'For certain functionalities, the Fundación Tamarindo Park website requests information from users through contact forms. By completing these forms, the user grants consent for the data provided to be used for the purpose stated in the form, such as managing requests, providing information about the Foundation\'s projects, activities, and initiatives, among others.',
      'Fundación Tamarindo Park, a non-profit organization, is committed to processing personal data provided by users in accordance with Costa Rican data protection legislation, particularly Law No. 8968, the Law on the Protection of Individuals with Regard to the Processing of Personal Data.',
      'Personal data provided by the user will be used solely for the stated purposes and will not be sold, transferred, or disclosed to third parties without the consent of the data subject, except in cases provided for by applicable legislation.',
      'Information provided by users may at some point be made publicly available. However, Fundación Tamarindo Park will strive to protect the confidentiality of other personal data such as email addresses or other personal contact information.',
      'This website may also use cookies or similar technologies to store information related to the user\'s session or browsing preferences. This data is used solely to improve the user\'s experience on the website. Users may configure their browser to accept or reject the use of cookies.',
      'In accordance with Law No. 8968, users may exercise their rights of access, rectification, or deletion of their personal data by submitting a request to Fundación Tamarindo Park at info@tamarindoparkfoundation.com',
      'Fundación Tamarindo Park reserves the right to update or modify this privacy policy when necessary, in order to adapt it to legal, technical, or operational changes to the website.',
    ],
  },
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const { title, paragraphs } = content[lang];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'es' ? styles.langBtnActive : ''}`}
              onClick={() => setLang('es')}
            >
              ES
            </button>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
        {paragraphs.map((text, i) => (
          <p key={i} className={styles.text}>{text}</p>
        ))}
      </div>
    </div>
  );
}
