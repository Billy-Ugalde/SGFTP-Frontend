import React, { useMemo, useState } from 'react';
import { BookType } from 'lucide-react';
import SectionContainer from '../components/SectionContainer';
import ContentBlockInput from '../components/ContentBlockInput';
import ContactInfoSection from '../components/ContactInfoSection';
import ImageUploadInput from '../components/ImageUploadInput';
import BackToDashboardButton from '../../../Shared/components/BackToDashboardButton';
import { ListState } from '../../../Shared/components';
import { usePageContent, useUpdateContentBlock } from '../services/contentBlockService';
import '../styles/InformativeAdminPage.css';

type TabKey =
  | 'hero'
  | 'value_proposition'
  | 'impact'
  | 'dimensions'
  | 'statistics'
  | 'descriptions'
  | 'board_members'
  | 'donate'
  | 'contact';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'value_proposition', label: 'Propuesta de Valor' },
  { key: 'impact', label: 'Impacto' },
  { key: 'dimensions', label: 'Dimensiones' },
  { key: 'statistics', label: 'Estadísticas' },
  { key: 'descriptions', label: 'Descripciones' },
  { key: 'board_members', label: 'Junta Directiva' },
  { key: 'donate', label: 'Donaciones' },
  { key: 'contact', label: 'Contacto' },
];

const InformativeAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('hero');
  const { data: pageData, isLoading, error, refetch } = usePageContent('home');
  const updateContentBlock = useUpdateContentBlock();

  const getBlockValue = (section: string, blockKey: string): string => {
    if (!pageData || !pageData[section]) return '';
    return pageData[section][blockKey] || '';
  };

  const boardMembers = useMemo(
    () => [
      { role: 'president', title: 'Presidente', nameKey: 'president_name', photoKey: 'president_photo' },
      { role: 'vice_president', title: 'Vicepresidente', nameKey: 'vice_president_name', photoKey: 'vice_president_photo' },
      { role: 'secretary', title: 'Secretario', nameKey: 'secretary_name', photoKey: 'secretary_photo' },
      { role: 'treasurer', title: 'Tesorero', nameKey: 'treasurer_name', photoKey: 'treasurer_photo' },
      { role: 'director', title: 'Director ejecutivo', nameKey: 'director_name', photoKey: 'director_photo' },
      { role: 'vocal', title: 'Vocal', nameKey: 'vocal_name', photoKey: 'vocal_photo' },
      { role: 'executive_representative', title: 'Representante del Poder Ejecutivo', nameKey: 'executive_representative_name', photoKey: 'executive_representative_photo' },
      { role: 'municipal_representative', title: 'Representante Municipal', nameKey: 'municipal_representative_name', photoKey: 'municipal_representative_photo' },
      { role: 'coordinator', title: 'Coordinador', nameKey: 'coordinator_name', photoKey: 'coordinator_photo' },
    ],
    []
  );

  if (isLoading || error) {
    return (
      <div className="informative-admin">
        <ListState
          isLoading={isLoading}
          error={error}
          loadingText="Cargando contenido..."
          errorTitle="No se pudieron cargar los contenidos"
          errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="informative-admin">
      {/* Header compacto */}
      <div className="informative-admin__header">
        <div className="informative-admin__header-inner">
          <div className="informative-admin__header-left">
            <div className="informative-admin__header-icon">
              <BookType size={18} strokeWidth={2} />
            </div>
            <h1 className="informative-admin__title">Gestión de Contenido</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main */}
      <div className="informative-admin__main">
        {/* Action bar con tabs */}
        <div className="informative-admin__action-bar">
          <div className="informative-admin__tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`informative-admin__tab ${activeTab === tab.key ? 'informative-admin__tab--active' : ''}`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la tab activa */}
        <div className="informative-admin__content">

          {activeTab === 'hero' && (
            <div className="admin-section-card">
              <h2>Sección Principal (Hero)</h2>
              <div className="admin-section-content">
                <SectionContainer title="Contenido Principal" section="hero" page="home" defaultExpanded={true}>
                  <ContentBlockInput
                    label="Título Principal"
                    page="home" section="hero" blockKey="title" type="text"
                    initialValue={getBlockValue('hero', 'title')}
                    placeholder="Ingresa el título principal..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Subtítulo"
                    page="home" section="hero" blockKey="subtitle" type="text"
                    initialValue={getBlockValue('hero', 'subtitle')}
                    placeholder="Ingresa el subtítulo..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción"
                    page="home" section="hero" blockKey="description" type="textarea"
                    initialValue={getBlockValue('hero', 'description')}
                    placeholder="Ingresa la descripción principal..."
                    onSave={() => { }}
                  />
                  <ImageUploadInput
                    label="Imagen de Fondo del Hero"
                    currentImageUrl={getBlockValue('hero', 'background')}
                    uploadEndpoint="/content/upload/home/hero/background"
                    maxSizeMB={50}
                    onUploadSuccess={async (newUrl) => {
                      await updateContentBlock.mutateAsync({
                        page: 'home', section: 'hero', blockKey: 'background',
                        data: { image_url: newUrl }
                      });
                    }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'value_proposition' && (
            <div className="admin-section-card">
              <h2>Propuesta de Valor</h2>
              <div className="admin-section-content">
                <SectionContainer title="Misión, Visión y Meta" section="value_proposition" page="home">
                  <ContentBlockInput
                    label="Misión"
                    page="home" section="value_proposition" blockKey="mission" type="textarea"
                    initialValue={getBlockValue('value_proposition', 'mission')}
                    placeholder="Describe la misión de la organización..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Visión"
                    page="home" section="value_proposition" blockKey="vision" type="textarea"
                    initialValue={getBlockValue('value_proposition', 'vision')}
                    placeholder="Describe la visión de la organización..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Meta"
                    page="home" section="value_proposition" blockKey="goal" type="textarea"
                    initialValue={getBlockValue('value_proposition', 'goal')}
                    placeholder="Describe el objetivo principal..."
                    onSave={() => { }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="admin-section-card">
              <h2>Sección de Impacto</h2>
              <div className="admin-section-content">
                <SectionContainer title="Áreas de Impacto" section="impact" page="home">
                  <ContentBlockInput
                    label="Impacto Social"
                    page="home" section="impact" blockKey="social_impact" type="textarea"
                    initialValue={getBlockValue('impact', 'social_impact')}
                    placeholder="Describe el impacto social..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Impacto Cultural"
                    page="home" section="impact" blockKey="cultural_impact" type="textarea"
                    initialValue={getBlockValue('impact', 'cultural_impact')}
                    placeholder="Describe el impacto cultural..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Impacto Ambiental"
                    page="home" section="impact" blockKey="environmental_impact" type="textarea"
                    initialValue={getBlockValue('impact', 'environmental_impact')}
                    placeholder="Describe el impacto ambiental..."
                    onSave={() => { }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'dimensions' && (
            <div className="admin-section-card">
              <h2>Dimensiones de Desarrollo</h2>
              <div className="admin-section-content">
                <SectionContainer title="Dimensiones de Desarrollo" section="dimensions" page="home">
                  <ContentBlockInput
                    label="Desarrollo Local"
                    page="home" section="dimensions" blockKey="local_development" type="textarea"
                    initialValue={getBlockValue('dimensions', 'local_development')}
                    placeholder="Describe el enfoque de desarrollo local..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Educación"
                    page="home" section="dimensions" blockKey="education" type="textarea"
                    initialValue={getBlockValue('dimensions', 'education')}
                    placeholder="Describe los programas educativos..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Prevención"
                    page="home" section="dimensions" blockKey="prevention" type="textarea"
                    initialValue={getBlockValue('dimensions', 'prevention')}
                    placeholder="Describe las iniciativas de prevención..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Conservación"
                    page="home" section="dimensions" blockKey="conservation" type="textarea"
                    initialValue={getBlockValue('dimensions', 'conservation')}
                    placeholder="Describe los esfuerzos de conservación..."
                    onSave={() => { }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="admin-section-card">
              <h2>Estadísticas</h2>
              <div className="admin-section-content">
                <SectionContainer title="Estadística Personalizada (Población Estudiantil)" section="statistics" page="home">
                  <ContentBlockInput
                    label="Nombre de la estadística"
                    page="home" section="statistics" blockKey="custom_stat_name" type="text"
                    initialValue={getBlockValue('statistics', 'custom_stat_name')}
                    placeholder="ej. Población estudiantil impactada..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Valor"
                    page="home" section="statistics" blockKey="custom_stat_value" type="text"
                    initialValue={getBlockValue('statistics', 'custom_stat_value')}
                    placeholder="ej. 500+, 1200..."
                    onSave={() => { }}
                  />
                </SectionContainer>
                <SectionContainer title="Descripciones de Estadísticas" section="statistics" page="home">
                  <ContentBlockInput
                    label="Descripción de Talleres"
                    page="home" section="statistics" blockKey="wokshops_content" type="text"
                    initialValue={getBlockValue('statistics', 'wokshops_content')}
                    placeholder="Descripción de los talleres realizados..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción de Personas Involucradas"
                    page="home" section="statistics" blockKey="involved_people" type="text"
                    initialValue={getBlockValue('statistics', 'involved_people')}
                    placeholder="Descripción de personas involucradas..."
                    onSave={() => { }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'descriptions' && (
            <div className="admin-section-card">
              <h2>Descripción de Secciones</h2>
              <div className="admin-section-content">
                <SectionContainer title="Descripciones de las Secciones" section="newsletter" page="home">
                  <ContentBlockInput
                    label="Descripción — Escuelas Participantes"
                    page="home" section="participating_schools" blockKey="description" type="textarea"
                    initialValue={getBlockValue('participating_schools', 'description')}
                    placeholder="Describe la sección de escuelas..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción — Emprendedores"
                    page="home" section="entrepreneurs" blockKey="description" type="textarea"
                    initialValue={getBlockValue('entrepreneurs', 'description')}
                    placeholder="Describe la sección de emprendedores..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción — Ferias"
                    page="home" section="fairs" blockKey="description" type="textarea"
                    initialValue={getBlockValue('fairs', 'description')}
                    placeholder="Describe la sección de ferias..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción — Involúcrate"
                    page="home" section="involve" blockKey="description" type="textarea"
                    initialValue={getBlockValue('involve', 'description')}
                    placeholder="Describe la sección involúcrate..."
                    onSave={() => { }}
                  />
                  <ContentBlockInput
                    label="Descripción — Boletín Informativo"
                    page="home" section="newsletter" blockKey="description" type="textarea"
                    initialValue={getBlockValue('newsletter', 'description')}
                    placeholder="Describe el boletín informativo..."
                    onSave={() => { }}
                  />
                </SectionContainer>

                <SectionContainer title="Mapa del Parque de la Fundación (Ferias Internas)" section="fairs" page="home">
                  <p style={{ color: 'var(--mid)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Esta imagen se muestra en el modal de inscripción a ferias internas como mapa de distribución de stands.
                    Si no se sube ninguna imagen, se usará el mapa predeterminado.
                  </p>
                  <ImageUploadInput
                    label="Mapa de Distribución de Stands"
                    currentImageUrl={getBlockValue('fairs', 'park_map')}
                    uploadEndpoint="/content/upload/home/fairs/park_map"
                    maxSizeMB={50}
                    onUploadSuccess={async (newUrl) => {
                      await updateContentBlock.mutateAsync({
                        page: 'home', section: 'fairs', blockKey: 'park_map',
                        data: { image_url: newUrl }
                      });
                    }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'board_members' && (
            <div className="admin-section-card">
              <h2>Miembros de la Junta Directiva</h2>
              <div className="admin-section-content">
                <SectionContainer title="Información de Miembros de la Junta" section="board_members" page="home">
                  {boardMembers.map((member) => (
                    <div key={member.role} className="admin-member-group">
                      <h4>{member.title}</h4>
                      <ContentBlockInput
                        label={`Nombre del ${member.title}`}
                        page="home" section="board_members" blockKey={member.nameKey} type="text"
                        initialValue={getBlockValue('board_members', member.nameKey)}
                        placeholder={`Ingresa el nombre del ${member.title.toLowerCase()}...`}
                        onSave={() => { }}
                      />
                      <ImageUploadInput
                        label={`Foto del ${member.title}`}
                        currentImageUrl={getBlockValue('board_members', member.photoKey)}
                        uploadEndpoint={`/content/upload/home/board_members/${member.role}_photo`}
                        maxSizeMB={50}
                        onUploadSuccess={async (newUrl) => {
                          await updateContentBlock.mutateAsync({
                            page: 'home', section: 'board_members', blockKey: member.photoKey,
                            data: { image_url: newUrl }
                          });
                        }}
                      />
                    </div>
                  ))}
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'donate' && (
            <div className="admin-section-card">
              <h2>Sección de Donaciones</h2>
              <div className="admin-section-content">
                <SectionContainer title="Información de Cuentas" section="donate" page="home">
                  <ImageUploadInput
                    label="Imagen de Información de Cuentas"
                    currentImageUrl={getBlockValue('donate', 'accounts_info')}
                    uploadEndpoint="/content/upload/home/donate/accounts_info"
                    maxSizeMB={50}
                    onUploadSuccess={async (newUrl) => {
                      await updateContentBlock.mutateAsync({
                        page: 'home', section: 'donate', blockKey: 'accounts_info',
                        data: { image_url: newUrl }
                      });
                    }}
                  />
                </SectionContainer>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="admin-section-card">
              <h2>Información de Contacto</h2>
              <div className="admin-section-content">
                <SectionContainer
                  title="Detalles de Contacto y Redes Sociales"
                  section="contact_info" page="contact" defaultExpanded={false}
                >
                  <ContactInfoSection />
                </SectionContainer>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InformativeAdminPage;
