// src/Modules/Informative/pages/Admin/InformativeAdminPage.tsx
import React, { useMemo } from 'react';
import SectionContainer from '../components/SectionContainer';
import ContentBlockInput from '../components/ContentBlockInput';
import ContactInfoSection from '../components/ContactInfoSection';
import { usePageContent } from '../services/contentBlockService';
import '../styles/InformativeAdminPage.css';

const InformativeAdminPage: React.FC = () => {
  // Cargar todo el contenido de la página 'home'
  const { data: pageData, isLoading, error } = usePageContent('home');

  // Función helper para obtener valor de un content block
  const getBlockValue = (section: string, blockKey: string): string => {
    if (!pageData || !pageData[section]) return '';
    return pageData[section][blockKey] || '';
  };

  // Organizar los miembros de la junta para renderizado fácil
  const boardMembers = useMemo(() => [
    {
      role: 'president',
      title: 'Presidente',
      nameKey: 'president_name',
      photoKey: 'president_photo'
    },
    {
      role: 'vice_president',
      title: 'Vicepresidente',
      nameKey: 'vice_president_name',
      photoKey: 'vice_president_photo'
    },
    {
      role: 'secretary',
      title: 'Secretario',
      nameKey: 'secretary_name',
      photoKey: 'secretary_photo'
    },
    {
      role: 'treasurer',
      title: 'Tesorero',
      nameKey: 'treasurer_name',
      photoKey: 'treasurer_photo'
    },
    {
      role: 'director',
      title: 'Director',
      nameKey: 'director_name',
      photoKey: 'director_photo'
    },
    {
      role: 'administrator',
      title: 'Administrador',
      nameKey: 'administrator_name',
      photoKey: 'administrator_photo'
    }
  ], []);

  const handleSave = (page: string, section: string, blockKey: string, value: string) => {
    console.log('Content saved:', { page, section, blockKey, value });
    // El ContentBlockInput ya maneja el guardado, esto es solo para logging
  };

    if (isLoading) {
    return (
      <div className="admin-informative">
        <div className="admin-loading-informative">
          <div className="admin-spinner"></div>
          <span>Cargando contenido...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-informative">
        <div className="admin-error-informative">
          <h2>Error al cargar contenido</h2>
          <p>No se pudo cargar el contenido de la página. Por favor intenta de nuevo.</p>
          <button onClick={() => window.location.reload()}>Recargar página</button>
        </div>
      </div>
    );
  }

  return (
    <div className="informative-admin">
      <div className="admin-informative-header">
        <h1>Gestión de Contenido</h1>
        <p>Administra los bloques de contenido del sitio web e información de contacto</p>
      </div>

      <div className="admin-sections-container">
        {/* Hero Section */}
        <div className="admin-section-card">
          <h2>Sección Principal (Hero)</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Contenido Principal" 
              section="hero" 
              page="home"
              defaultExpanded={true}
            >
              <ContentBlockInput
                label="Título Principal"
                page="home"
                section="hero"
                blockKey="title"
                type="text"
                initialValue={getBlockValue('hero', 'title')}
                placeholder="Ingresa el título principal..."
                onSave={(value) => handleSave('home', 'hero', 'title', value)}
              />
              
              <ContentBlockInput
                label="Subtítulo"
                page="home"
                section="hero"
                blockKey="subtitle"
                type="text"
                initialValue={getBlockValue('hero', 'subtitle')}
                placeholder="Ingresa el subtítulo..."
                onSave={(value) => handleSave('home', 'hero', 'subtitle', value)}
              />
              
              <ContentBlockInput
                label="Descripción"
                page="home"
                section="hero"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('hero', 'description')}
                placeholder="Ingresa la descripción principal..."
                onSave={(value) => handleSave('home', 'hero', 'description', value)}
              />
              
              <ContentBlockInput
                label="URL de Imagen de Fondo"
                page="home"
                section="hero"
                blockKey="background"
                type="image"
                initialValue={getBlockValue('hero', 'background')}
                placeholder="https://example.com/imagen-fondo.jpg"
                onSave={(value) => handleSave('home', 'hero', 'background', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="admin-section-card">
          <h2>Propuesta de Valor</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Misión, Visión y Meta" 
              section="value_proposition" 
              page="home"
            >
              <ContentBlockInput
                label="Misión"
                page="home"
                section="value_proposition"
                blockKey="mission"
                type="textarea"
                initialValue={getBlockValue('value_proposition', 'mission')}
                placeholder="Describe la misión de la organización..."
                onSave={(value) => handleSave('home', 'value_proposition', 'mission', value)}
              />
              
              <ContentBlockInput
                label="Visión"
                page="home"
                section="value_proposition"
                blockKey="vision"
                type="textarea"
                initialValue={getBlockValue('value_proposition', 'vision')}
                placeholder="Describe la visión de la organización..."
                onSave={(value) => handleSave('home', 'value_proposition', 'vision', value)}
              />
              
              <ContentBlockInput
                label="Meta"
                page="home"
                section="value_proposition"
                blockKey="goal"
                type="textarea"
                initialValue={getBlockValue('value_proposition', 'goal')}
                placeholder="Describe el objetivo principal..."
                onSave={(value) => handleSave('home', 'value_proposition', 'goal', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Impact Section */}
        <div className="admin-section-card">
          <h2>Sección de Impacto</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Áreas de Impacto" 
              section="impact" 
              page="home"
            >
              <ContentBlockInput
                label="Impacto Social"
                page="home"
                section="impact"
                blockKey="social_impact"
                type="textarea"
                initialValue={getBlockValue('impact', 'social_impact')}
                placeholder="Describe el impacto social..."
                onSave={(value) => handleSave('home', 'impact', 'social_impact', value)}
              />
              
              <ContentBlockInput
                label="Impacto Cultural"
                page="home"
                section="impact"
                blockKey="cultural_impact"
                type="textarea"
                initialValue={getBlockValue('impact', 'cultural_impact')}
                placeholder="Describe el impacto cultural..."
                onSave={(value) => handleSave('home', 'impact', 'cultural_impact', value)}
              />
              
              <ContentBlockInput
                label="Impacto Ambiental"
                page="home"
                section="impact"
                blockKey="environmental_impact"
                type="textarea"
                initialValue={getBlockValue('impact', 'environmental_impact')}
                placeholder="Describe el impacto ambiental..."
                onSave={(value) => handleSave('home', 'impact', 'environmental_impact', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="admin-section-card">
          <h2>Dimensiones de Desarrollo</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Dimensiones de Desarrollo" 
              section="dimensions" 
              page="home"
            >
              <ContentBlockInput
                label="Desarrollo Local"
                page="home"
                section="dimensions"
                blockKey="local_development"
                type="textarea"
                initialValue={getBlockValue('dimensions', 'local_development')}
                placeholder="Describe el enfoque de desarrollo local..."
                onSave={(value) => handleSave('home', 'dimensions', 'local_development', value)}
              />
              
              <ContentBlockInput
                label="Educación"
                page="home"
                section="dimensions"
                blockKey="education"
                type="textarea"
                initialValue={getBlockValue('dimensions', 'education')}
                placeholder="Describe los programas educativos..."
                onSave={(value) => handleSave('home', 'dimensions', 'education', value)}
              />
              
              <ContentBlockInput
                label="Prevención"
                page="home"
                section="dimensions"
                blockKey="prevention"
                type="textarea"
                initialValue={getBlockValue('dimensions', 'prevention')}
                placeholder="Describe las iniciativas de prevención..."
                onSave={(value) => handleSave('home', 'dimensions', 'prevention', value)}
              />
              
              <ContentBlockInput
                label="Conservación"
                page="home"
                section="dimensions"
                blockKey="conservation"
                type="textarea"
                initialValue={getBlockValue('dimensions', 'conservation')}
                placeholder="Describe los esfuerzos de conservación..."
                onSave={(value) => handleSave('home', 'dimensions', 'conservation', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="admin-section-card">
          <h2>Estadísticas</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Estadística Clave" 
              section="statistics" 
              page="home"
            >
              <ContentBlockInput
                label="Valor de la Estadística"
                page="home"
                section="statistics"
                blockKey="custom_stat_value"
                type="text"
                initialValue={getBlockValue('statistics', 'custom_stat_value')}
                placeholder="ej. 150, 25%, $10K..."
                onSave={(value) => handleSave('home', 'statistics', 'custom_stat_value', value)}
              />
              
              <ContentBlockInput
                label="Nombre/Descripción de la Estadística"
                page="home"
                section="statistics"
                blockKey="custom_stat_name"
                type="text"
                initialValue={getBlockValue('statistics', 'custom_stat_name')}
                placeholder="ej. Proyectos Completados, Comunidades Servidas..."
                onSave={(value) => handleSave('home', 'statistics', 'custom_stat_name', value)}
              />
              
              <ContentBlockInput
                label="Descripción Adicional de la Estadística Talleres"
                page="home"
                section="statistics"
                blockKey="wokshops_content"
                type="text"
                initialValue={getBlockValue('statistics', 'wokshops_content')}
                placeholder="ej. Proyectos Completados, Comunidades Servidas..."
                onSave={(value) => handleSave('home', 'statistics', 'wokshops_content', value)}
              />

              <ContentBlockInput
                label="Descripción Adicional de la Estadística Personas involucradas"
                page="home"
                section="statistics"
                blockKey="involved_people"
                type="text"
                initialValue={getBlockValue('statistics', 'involved_people')}
                placeholder="ej. Proyectos Completados, Comunidades Servidas..."
                onSave={(value) => handleSave('home', 'statistics', 'involved_people', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Section Descriptions */}
        <div className="admin-section-card">
          <h2>Descripción de secciones</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Descripciones de las Secciones" 
              section="newsletter" 
              page="home"
            >
              <ContentBlockInput
                label="Descripción de la Sección Escuelas Participantes"
                page="home"
                section="participating_schools"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('participating_schools', 'description')}
                placeholder="Describe el boletín informativo..."
                onSave={(value) => handleSave('home', 'participating_schools', 'description', value)}
              />
              <ContentBlockInput
                label="Descripción de la Sección Emprendedores"
                page="home"
                section="entrepreneurs"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('entrepreneurs', 'description')}
                placeholder="Describe la sección de emprendedores..."
                onSave={(value) => handleSave('home', 'entrepreneurs', 'description', value)}
              />
              <ContentBlockInput
                label="Descripción de la Sección Ferias"
                page="home"
                section="fairs"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('fairs', 'description')}
                placeholder="Describe la sección de ferias..."
                onSave={(value) => handleSave('home', 'fairs', 'description', value)}
              />
              <ContentBlockInput
                label="Descripción de la Sección Involúcrate"
                page="home"
                section="involve"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('involve', 'description')}
                placeholder="Describe el boletín informativo..."
                onSave={(value) => handleSave('home', 'involve', 'description', value)}
              />
              <ContentBlockInput
                label="Descripción de la Sección Boletín Informativo"
                page="home"
                section="newsletter"
                blockKey="description"
                type="textarea"
                initialValue={getBlockValue('newsletter', 'description')}
                placeholder="Describe el boletín informativo..."
                onSave={(value) => handleSave('home', 'newsletter', 'description', value)}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Board Members Section */}
        <div className="admin-section-card">
          <h2>Miembros de la Junta Directiva</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Información de Miembros de la Junta" 
              section="board_members" 
              page="home"
            >
              {boardMembers.map((member) => (
                <div key={member.role} className="admin-member-group">
                  <h4>{member.title}</h4>
                  
                  <ContentBlockInput
                    label={`Nombre del ${member.title}`}
                    page="home"
                    section="board_members"
                    blockKey={member.nameKey}
                    type="text"
                    initialValue={getBlockValue('board_members', member.nameKey)}
                    placeholder={`Ingresa el nombre del ${member.title.toLowerCase()}...`}
                    onSave={(value) => handleSave('home', 'board_members', member.nameKey, value)}
                  />
                  
                  <ContentBlockInput
                    label={`Foto del ${member.title}`}
                    page="home"
                    section="board_members"
                    blockKey={member.photoKey}
                    type="image"
                    initialValue={getBlockValue('board_members', member.photoKey)}
                    placeholder="https://example.com/foto.jpg"
                    onSave={(value) => handleSave('home', 'board_members', member.photoKey, value)}
                  />
                </div>
              ))}
            </SectionContainer>
          </div>
        </div>

        {/* Contact Information */}
        <div className="admin-section-card">
          <h2>Información de Contacto</h2>
          <div className="admin-section-content">
            <SectionContainer 
              title="Detalles de Contacto y Redes Sociales" 
              section="contact_info" 
              page="contact"
              defaultExpanded={false}
            >
              <ContactInfoSection />
            </SectionContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformativeAdminPage;