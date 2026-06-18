import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsDetailModal from '../../../News/Components/NewsDetailModal';
import { usePublishedNews, type NewsBE } from '../../../News/Services/NewsServices';
import { API_BASE_URL } from '../../../../config/env';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import Pagination from '../components/Pagination';
import styles from '../styles/AllNewsView.module.css';
import '../styles/public-view.css';

const getProxiedImageUrl = (driveUrl?: string) => {
  if (!driveUrl) return '';
  return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

const fmt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

const AllNewsView: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = usePublishedNews();
  const PAGE_SIZE = useCardsPerPage();

  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState<NewsBE | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => { setCurrentPage(1); }, [PAGE_SIZE]);

  const items = useMemo<NewsBE[]>(() => {
    const base = (data ?? []).filter((n) => n.status === 'published');
    base.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );
    return base;
  }, [data]);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <NewsDetailModal news={preview} onClose={() => setPreview(null)} />

      <div className={styles.page}>
        <Header hideNav onBack={() => navigate('/#noticias')} />

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Todas las Noticias</h1>
            {!isLoading && items.length > 0 && (
              <p className={styles.heroSub}>
                {`${items.length} ${items.length === 1 ? 'noticia publicada' : 'noticias publicadas'}`}
              </p>
            )}
          </div>
        </header>

        <main className={styles.main}>

          {/* Loading */}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando noticias…</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && items.length === 0 && (
            <div className={styles.empty}>
              <p>Aún no hay noticias publicadas.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && items.length > 0 && (
            <div className={styles.grid}>
              {paginated.map((n) => (
                <article
                  key={n.id_news}
                  className={styles.card}
                  onClick={() => setPreview(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreview(n);
                    }
                  }}
                >
                  <div className={styles.cardThumb}>
                    {n.image_url ? (
                      <img src={getProxiedImageUrl(n.image_url)} alt={n.title} loading="lazy" />
                    ) : (
                      <div className={styles.cardThumbFallback}>
                        <span>🖼 Imagen de Noticia</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardDate}>{fmt(n.publicationDate)}</span>
                    <h3 className={styles.cardTitle}>{n.title}</h3>
                    <p className={styles.cardExcerpt}>{n.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Paginación */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              classes={styles}
            />
          )}

        </main>

        <Footer />
      </div>
    </>
  );
};

export default AllNewsView;
