// src/Modules/News/Pages/NewsPage.tsx
import React, { useMemo, useState } from 'react';
import { useNews } from '../Services/NewsServices';
import NewsList from '../Components/NewsList';
import NewsForm from '../Components/NewsForm';
import '../Styles/News.css';

export default function NewsPage() {
  const { data, isLoading, isError } = useNews();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const items = useMemo(() => data ?? [], [data]);
  const onEdit = (n: any | null) => { setEditing(n); setOpenForm(true); };

  return (
    <div className="admin-shell">
      {/* HERO compacto: ícono a la izquierda, título centrado, botón a la derecha */}
      <header className="hero hero--news-tight">
        <div className="hero__left">
          <div className="hero__badge-left" aria-hidden>📰</div>
        </div>

        <div className="hero__center">
          <h1>Gestión de Noticias</h1>
          <div className="hero__leaf" aria-hidden>🌿</div>
          <p>
            Administra y organiza las noticias para la fundación. Crea, edita, publica y archiva
            contenidos para la vista pública manteniendo la auditoría del sistema. Con apoyo de la{' '}
            <a className="link-green" href="https://tamarindopark.com" target="_blank" rel="noreferrer">
              Fundación Tamarindo Park
            </a>.
          </p>
        </div>

        <div className="hero__right">
          <button className="btn btn--back" onClick={() => history.back()}>
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      {/* Banda verde suave (delgada) */}
      <section className="section-soft">
        <div className="container">
          {isError && <div className="alert alert--danger">No se pudieron cargar las noticias.</div>}
          {isLoading ? (
            <div className="skeleton">Cargando…</div>
          ) : (
            <NewsList items={items} onEdit={onEdit} />
          )}
        </div>
      </section>

      <NewsForm open={openForm} onClose={() => setOpenForm(false)} initial={editing} />
    </div>
  );
}
