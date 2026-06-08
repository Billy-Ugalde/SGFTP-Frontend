import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  EntrepreneurPublicCard,
  buildEntrepreneurCardData,
  isActiveApprovedEntrepreneur,
} from '../components/Entrepreneurs';
import EntrepreneurDetailsModal from '../../../Entrepreneurs/Components/EntrepreneurDetailsModal';
import { useEntrepreneurs } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import type { Entrepreneur } from '../../../Entrepreneurs/Types';
import { API_BASE_URL } from '../../../../config/env';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import styles from '../styles/AllProjectsView.module.css';
import entrepreneursStyles from '../styles/Entrepreneurs.module.css';
import '../styles/public-view.css';

const AllEntrepreneursView: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useEntrepreneurs();
  const PAGE_SIZE = useCardsPerPage();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetails(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  useEffect(() => { setCurrentPage(1); }, [PAGE_SIZE]);

  const openDetails = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedEntrepreneur(null);
  };

  const cards = useMemo(() => {
    const list = (data ?? []).filter(isActiveApprovedEntrepreneur);
    return list.map(buildEntrepreneurCardData);
  }, [data]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cards) {
      if (c.category) counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, [cards]);

  const visibleCategories = Object.keys(countByCategory).sort((a, b) => a.localeCompare(b));

  const filtered = useMemo(
    () => (activeCategory ? cards.filter(c => c.category === activeCategory) : cards),
    [cards, activeCategory]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (category: string | null) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prefetch = (id?: number) => {
    if (!id) return;
    queryClient.prefetchQuery({
      queryKey: ['entrepreneurs', 'detail', id],
      queryFn: async () => {
        const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/entrepreneurs/${id}`);
        if (!res.ok) throw new Error('Prefetch failed');
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <>
      <div className={styles.page}>
        <Header hideNav onBack={() => navigate('/')} />

        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Emprendedores locales</h1>
            {!isLoading && (
              <p className={styles.heroSub}>
                {cards.length === 0
                  ? 'No hay emprendedores disponibles en este momento'
                  : `${cards.length} ${cards.length === 1 ? 'emprendedor' : 'emprendedores'}`}
              </p>
            )}
          </div>
        </header>

        <main className={styles.main}>

          {!isLoading && visibleCategories.length > 1 && (
            <div className={styles.filtersBar}>
              <button
                className={`${styles.filterChip} ${!activeCategory ? styles.filterChipActive : ''}`}
                onClick={() => handleFilterChange(null)}
              >
                Todos
                <span className={styles.filterBadge}>{cards.length}</span>
              </button>
              {visibleCategories.map(c => (
                <button
                  key={c}
                  className={`${styles.filterChip} ${activeCategory === c ? styles.filterChipActive : ''}`}
                  onClick={() => handleFilterChange(activeCategory === c ? null : c)}
                >
                  {c}
                  <span className={styles.filterBadge}>{countByCategory[c]}</span>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando emprendedores…</p>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className={styles.empty}>
              <p>No hay emprendedores {activeCategory ? 'en esta categoría' : 'disponibles en este momento'}.</p>
              {activeCategory && (
                <button className={styles.emptyReset} onClick={() => handleFilterChange(null)}>
                  Ver todos
                </button>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className={entrepreneursStyles.empGrid}>
              {paginated.map(datum => (
                <EntrepreneurPublicCard
                  key={String(datum.id ?? datum.name)}
                  data={datum}
                  onOpen={openDetails}
                  onPrefetch={prefetch}
                />
              ))}
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >←</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Ir a página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >{page}</button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >→</button>
            </div>
          )}

        </main>

        <Footer />
      </div>

      <EntrepreneurDetailsModal
        entrepreneur={selectedEntrepreneur}
        show={isModalOpen}
        onClose={closeDetails}
      />
    </>
  );
};

export default AllEntrepreneursView;
