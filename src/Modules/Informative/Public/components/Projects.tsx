import React, { useState } from 'react';
import type { ProjectItem } from '../../services/informativeService';

interface Props {
  data: ProjectItem[];
}

const Projects: React.FC<Props> = ({ data }) => {
  const [filter, setFilter] = useState<string>('Todos');

  const regiones = ['Todos', ...Array.from(new Set(data.map(p => p.location)))];

  const proyectosFiltrados = filter === 'Todos'
    ? data
    : data.filter(p => p.location === filter);

  return (
    <section className="projects-section section" id="proyectos">
       <h2 className="section-title">Eventos Realizados</h2>  
      <div className="projects-filter">
        {regiones.map((region, index) => (
          <button
            key={index}
            className={`filter-btn ${filter === region ? 'active' : ''}`}
            onClick={() => setFilter(region)}
          >
            {region}
          </button>
        ))}
      </div>
      <div className="projects-grid">
        {proyectosFiltrados.map((project, index) => (
          <div className="project-card" key={index}>
            <div className="project-img">{project.image}</div>
            <div className="project-content">
              <span className="project-location">{project.location}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p><strong>Impacto:</strong> {project.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
