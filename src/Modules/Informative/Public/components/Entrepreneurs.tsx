import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntrepreneurs, useEntrepreneurById } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import type { Entrepreneur } from '../../../Entrepreneurs/Types';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../../config/env';
import EntrepreneurDetailsModal from '../../../Entrepreneurs/Components/EntrepreneurDetailsModal';
import entrepreneursStyles from '../styles/Entrepreneurs.module.css';
import { buildWhatsAppUrl } from '../../../../shared/utils/phone.utils';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import { Mail } from 'lucide-react';

interface Props { subtitle?: string; onRegisterClick?: () => void; }
type AnyObj = Record<string, any>;

/* ====================== Config & helpers ====================== */
const API_BASE: string = API_BASE_URL;

/** OFF por defecto para no generar 404. Actívalo con VITE_TRY_IMAGE_ENDPOINTS=true si tu backend expone esos endpoints. */
const TRY_IMAGE_ENDPOINTS: boolean =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_TRY_IMAGE_ENDPOINTS === 'true') ||
  (typeof window !== 'undefined' && (window as any).__TRY_IMAGE_ENDPOINTS__ === true);

const biz = (src: AnyObj) => src?.entrepreneurship ?? src?.emprendimiento ?? {};

const isApproved = (e: AnyObj) => {
  const s = (e?.status ?? e?.estado ?? '').toString().toLowerCase();
  return e?.is_approved === true || ['approved', 'aprobado', 'aprobada'].includes(s);
};

const fullName = (e: AnyObj): string => {
  if (e?.person) {
    return [e.person.first_name, e.person.second_name, e.person.first_lastname, e.person.second_lastname]
      .filter(Boolean).join(' ').trim();
  }
  const name = e?.name ?? e?.full_name ?? [e?.first_name, e?.last_name].filter(Boolean).join(' ');
  return (name || '').trim();
};

const getEmail = (src: AnyObj): string => {
  const b = biz(src);
  return (
    src?.person?.email ??
    src?.email ?? src?.correo ?? src?.contact_email ??
    b?.email ?? b?.correo ?? b?.contact_email ?? ''
  );
};

/* ---------- Teléfonos ---------- */
const getPrimaryPhone = (src: AnyObj): string => {
  return (
    src?.person?.phone_primary ??
    src?.phone_primary ??
    src?.person?.phone ??
    src?.phone ??
    ''
  );
};

const waHref = (src: AnyObj): string => {
  const phone = getPrimaryPhone(src);
  return buildWhatsAppUrl(phone);
};

/* ---------- Campos de negocio ---------- */
const getBizName = (src: AnyObj) => biz(src)?.name ?? biz(src)?.nombre ?? '';
const getBizDescription = (src: AnyObj) => biz(src)?.description ?? biz(src)?.descripcion ?? '';
const getBizLocation = (src: AnyObj) => biz(src)?.location ?? biz(src)?.ubicacion ?? '';
const getBizCategory = (src: AnyObj) => biz(src)?.category ?? biz(src)?.categoria ?? '';

/* ---------- Imágenes con soporte para Google Drive ---------- */
const resolveUrl = (u: string): string => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const path = u.startsWith('/') ? u.slice(1) : u;
  return `${API_BASE.replace(/\/+$/, '')}/${path}`;
};

// Función para convertir URL de Drive al formato proxy (igual que en tu modal)
const getProxyImageUrl = (url: string): string => {
  if (!url) return '';

  // Si ya es una URL de proxy, devolverla tal cual
  if (url.includes('/images/proxy')) return url;

  // Si es una URL de Google Drive, usar el proxy
  if (url.includes('drive.google.com')) {
    return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
  }

  // Para otras URLs, devolver tal cual
  return url;
};

const looksLikeImagePath = (s: string) =>
  /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(s) ||
  /^(uploads|images|img|files)\//i.test(s) ||
  s.includes('drive.google.com'); // Agregamos soporte para URLs de Drive

const deepCollectImageStrings = (obj: any, acc: string[] = [], depth = 0): string[] => {
  if (!obj || depth > 4) return acc;
  if (typeof obj === 'string') {
    const t = obj.trim();
    if (t && looksLikeImagePath(t)) acc.push(t);
    return acc;
  }
  if (Array.isArray(obj)) {
    for (const it of obj) deepCollectImageStrings(it, acc, depth + 1);
    return acc;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (['url', 'image', 'src', 'path', 'href', 'file', 'filename', 'filepath', 'url_1', 'url_2', 'url_3'].includes(k)) {
        if (typeof v === 'string' && v.trim()) acc.push(v.trim());
      }
      deepCollectImageStrings(v, acc, depth + 1);
    }
  }
  return acc;
};

const getBizImagesFromObject = (src: AnyObj): string[] => {
  const b = biz(src);
  const bags: any[] = [
    b?.images, b?.imagenes, b?.fotos, b?.gallery, b?.galeria,
    b?.pictures, b?.imgs, b?.photos, b?.multimedia, b?.attachments,
    src?.images, src?.imagenes, src?.fotos,
    // Agregamos soporte específico para las URLs de tu modal
    b?.url_1, b?.url_2, b?.url_3,
    src?.url_1, src?.url_2, src?.url_3
  ].filter(x => x != null);

  const csv = bags
    .filter(x => typeof x === 'string')
    .flatMap((s: string) => s.split(',').map(s2 => s2.trim()).filter(Boolean));

  const arr = bags.filter(Array.isArray) as any[][];
  const fromArrays = arr.flatMap(a => a.flatMap((x: any) => {
    if (typeof x === 'string') return [x];
    if (typeof x === 'object') {
      const cand = x.url ?? x.image ?? x.src ?? x.path ?? x.href ?? x.file ?? x.filename ?? x.filepath ?? x.url_1 ?? x.url_2 ?? x.url_3 ?? '';
      return cand ? [cand] : [];
    }
    return [];
  }));

  const singles = [b?.image, b?.image1, b?.image2, b?.image3, b?.cover, b?.portada].filter(Boolean) as string[];

  const deep = deepCollectImageStrings(src);

  const raw = [...csv, ...fromArrays, ...singles, ...deep]
    .map(s => s?.toString?.().trim?.()).filter(Boolean) as string[];

  // Usar getProxyImageUrl para URLs de Drive, resolveUrl para el resto
  const processed = raw.map(url => {
    if (url.includes('drive.google.com')) {
      return getProxyImageUrl(url);
    }
    return resolveUrl(url);
  });

  return Array.from(new Set(processed)).filter(url => looksLikeImagePath(url)).slice(0, 3);
};

const fetchImagesByKnownEndpoints = async (id?: number | string): Promise<string[]> => {
  if (!id) return [];
  const endpoints = [
    `${API_BASE.replace(/\/+$/, '')}/entrepreneurs/${id}/images`,
    `${API_BASE.replace(/\/+$/, '')}/entrepreneurships/${id}/images`,
    `${API_BASE.replace(/\/+$/, '')}/files/entrepreneurs/${id}`,
  ];
  for (const url of endpoints) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.images) ? data.images : []);
      const urls = (list as any[]).flatMap(x => typeof x === 'string' ? [x] : [x?.url, x?.image, x?.src, x?.path, x?.file]).filter(Boolean);
      const processed = urls.map((u: string) => {
        const url = String(u);
        if (url.includes('drive.google.com')) {
          return getProxyImageUrl(url);
        }
        return resolveUrl(url);
      });
      const uniques = Array.from(new Set(processed)).filter(url => looksLikeImagePath(url)).slice(0, 3);
      if (uniques.length) return uniques;
    } catch { /* ignore */ }
  }
  return [];
};

/* ====================================================================================
   CARD PÚBLICO
   ==================================================================================== */
type CardData = {
  id?: number | string;
  raw: Entrepreneur;
  category: string;
  name: string;
  person: string;
  desc: string;
  email: string;
  location: string;
  listImages: string[];
  wa: string;
};

export function buildEntrepreneurCardData(e: Entrepreneur): CardData {
  return {
    id: (e as any).id_entrepreneur ?? (e as any).id,
    raw: e,
    category: getBizCategory(e),
    name: getBizName(e),
    person: fullName(e),
    desc: getBizDescription(e),
    email: getEmail(e),
    location: getBizLocation(e),
    listImages: getBizImagesFromObject(e),
    wa: waHref(e),
  };
}

export function isActiveApprovedEntrepreneur(e: Entrepreneur): boolean {
  return isApproved(e) && (e as any).is_active !== false && !!(e as any).entrepreneurship;
}

export function EntrepreneurPublicCard({
  data,
  onOpen,
  onPrefetch,
}: {
  data: CardData;
  onOpen: (e: Entrepreneur) => void;
  onPrefetch?: (id?: number) => void;
}) {
  const numericId = typeof data.id === 'string' ? parseInt(data.id) : (data.id as number | undefined);
  const { data: detail } = useEntrepreneurById(numericId);

  const primary = useMemo(
    () => (detail ? getBizImagesFromObject(detail) : []),
    [detail]
  );

  // Campos de texto: se prefiere el dato del detalle (objeto completo), con fallback a la lista
  const displayName     = (detail ? getBizName(detail as AnyObj)        : '') || data.name;
  const displayDesc     = (detail ? getBizDescription(detail as AnyObj) : '') || data.desc;
  const displayLocation = (detail ? getBizLocation(detail as AnyObj)    : '') || data.location;
  const displayCategory = (detail ? getBizCategory(detail as AnyObj)    : '') || data.category;
  const displayPerson   = (detail ? fullName(detail as AnyObj)          : '') || data.person;
  const displayEmail    = (detail ? getEmail(detail as AnyObj)          : '') || data.email;
  const displayWa       = (detail ? waHref(detail as AnyObj)            : '') || data.wa;

  const [extra, setExtra] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!TRY_IMAGE_ENDPOINTS) { setExtra([]); return; }
      if (primary.length) { setExtra([]); return; }
      const urls = await fetchImagesByKnownEndpoints(numericId);
      if (mounted) setExtra(urls);
    })();
    return () => { mounted = false; };
  }, [numericId, primary.length]);

  const fallbackList = useMemo(() => (data.listImages ?? []).map(url => {
    if (url.includes('drive.google.com')) {
      return getProxyImageUrl(url);
    }
    return resolveUrl(url);
  }), [data.listImages]);

  const images = useMemo(() => {
    const merged = primary.length ? primary : (extra.length ? extra : fallbackList);
    return merged.slice(0, 3);
  }, [primary, extra, fallbackList]);

  // Carrusel (auto) -> 3 segundos
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!images.length) return;
    const id = window.setInterval(() => setSlide(s => (s + 1) % images.length), 3000);
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <article
      className={entrepreneursStyles.entrepreneursCard}
      onMouseEnter={() => onPrefetch?.((data.raw as any).id_entrepreneur)}
      onClick={() => onOpen(data.raw)}
    >
      <div className={entrepreneursStyles.entrepreneursCardTop}>
        {displayCategory && (
          <span className={entrepreneursStyles.entrepreneursChip}>{displayCategory}</span>
        )}
        {images.length > 0 ? (
          <img
            key={slide}
            src={images[slide]}
            alt={`${displayName} - imagen ${slide + 1}`}
            className={entrepreneursStyles.entrepreneursCardHero}
            crossOrigin="anonymous"
          />
        ) : (
          <span>🌿</span>
        )}
      </div>

      <div className={entrepreneursStyles.entrepreneursCardBody}>
        <div className={entrepreneursStyles.entrepreneursCardContent}>
          <h3 className={entrepreneursStyles.entrepreneursCardSubtitle}>{displayName}</h3>

          {displayPerson && (
            <div className={entrepreneursStyles.empPerson}>
              <svg className={entrepreneursStyles.empPersonIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span>{displayPerson}</span>
            </div>
          )}

          {displayLocation && (
            <div className={entrepreneursStyles.empLoc}>
              <svg className={entrepreneursStyles.empLocIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a7 7 0 0 1 7 7c0 3.87-7 13-7 13S5 12.87 5 9a7 7 0 0 1 7-7zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5z" />
              </svg>
              <span>{displayLocation}</span>
            </div>
          )}

          {displayDesc && <p className={entrepreneursStyles.entrepreneursDesc}>{displayDesc}</p>}
        </div>

        <div className={entrepreneursStyles.empRow}>
          {displayWa && (
            <a
              className={`${entrepreneursStyles.empIconBtn} ${entrepreneursStyles.empIconBtnWa}`}
              href={displayWa}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Contactar por WhatsApp"
              aria-label="Contactar por WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.49 0 .2 5.29.2 11.84c0 2.08.54 4.1 1.56 5.9L0 24l6.42-1.67a11.75 11.75 0 0 0 5.62 1.44h.01c6.55 0 11.84-5.29 11.84-11.84 0-3.17-1.23-6.16-3.37-8.45zm-8.48 18.1h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.81.99 1.02-3.71-.24-.38A9.83 9.83 0 0 1 2.2 11.84c0-5.42 4.41-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.85 9.84zm5.4-7.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.89 1.23 3.09.15.2 2.13 3.26 5.16 4.57.72.31 1.29.5 1.73.64.73.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.43.25-.71.25-1.31.17-1.44-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>
          )}
          {displayEmail && (
            <a
              className={entrepreneursStyles.empIconBtn}
              href={`mailto:${displayEmail}`}
              onClick={(e) => e.stopPropagation()}
              title="Enviar correo electrónico"
              aria-label="Enviar correo electrónico"
            >
              <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
            </a>
          )}
          <button
            className={entrepreneursStyles.empDetailBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(data.raw);
            }}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  );
}

/* ================= Contenedor principal ================= */
const Entrepreneurs: React.FC<Props> = ({ subtitle, onRegisterClick }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEntrepreneurs();

  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = useCardsPerPage();

  useEffect(() => { setPage(0); }, [PER_PAGE]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetails(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  const openDetails = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedEntrepreneur(null);
  };

  const active = useMemo(() => {
    const list = data ?? [];
    return list.filter(isActiveApprovedEntrepreneur);
  }, [data]);

  const EmpHeader = ({ msg }: { msg: string }) => (
    <section className={entrepreneursStyles.entrepreneursShell} id="emprendedores">
      <div className="section">
        <div className={entrepreneursStyles.sectionHeader}>
          <div>
            <div className={entrepreneursStyles.empKicker}>09 — Red local</div>
            <h2 className={entrepreneursStyles.empTitle}><strong>Emprendedores</strong> <em>locales</em></h2>
          </div>
          <button className={entrepreneursStyles.verTodosBtn} onClick={() => navigate('/emprendedores')}>
            Ver todos →
          </button>
        </div>
        <p className={entrepreneursStyles.entrepreneursSubtitle} style={{ marginTop: '1.75rem' }}>{msg}</p>
      </div>
    </section>
  );

  if (isLoading) return <EmpHeader msg="Cargando…" />;
  if (error)     return <EmpHeader msg="Ocurrió un error al cargar los emprendimientos." />;
  if (active.length === 0) return <EmpHeader msg="Pronto agregaremos nuevos emprendedores y sus emprendimientos para el público." />;

  const totalPages = Math.ceil(active.length / PER_PAGE);
  const visibleActive = active.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const makeCard = (e: Entrepreneur) => {
    const datum = buildEntrepreneurCardData(e);
    return (
      <EntrepreneurPublicCard
        key={String(datum.id ?? `${datum.name}-${Math.random()}`)}
        data={datum}
        onOpen={openDetails}
        onPrefetch={(id) => {
          if (!id) return;
          queryClient.prefetchQuery({
            queryKey: ['entrepreneurs', 'detail', id],
            queryFn: async () => {
              const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/entrepreneurs/${id}`);
              if (!res.ok) throw new Error('Prefetch failed');
              return res.json();
            },
            staleTime: 5 * 60 * 1000,
          });
        }}
      />
    );
  };

  return (
    <section className={entrepreneursStyles.entrepreneursShell} id="emprendedores">
      <div className='section'>

        <div className={entrepreneursStyles.sectionHeader}>
          <div>
            <div className={entrepreneursStyles.empKicker}>09 — Red local</div>
            <h2 className={entrepreneursStyles.empTitle}><strong>Emprendedores</strong> <em>locales</em></h2>
          </div>
          <button
            className={entrepreneursStyles.verTodosBtn}
            onClick={() => navigate('/emprendedores')}
          >
            Ver todos →
          </button>
        </div>

        <p className={entrepreneursStyles.entrepreneursSubtitle}>
          {subtitle ?? 'Apoya la economía de Guanacaste conectando con emprendedores ligados a la fundación.'}
        </p>

        <div className={entrepreneursStyles.empGrid}>
          {visibleActive.map(makeCard)}
        </div>

        {totalPages > 1 && (
          <div className={entrepreneursStyles.empNav}>
            <button
              className={entrepreneursStyles.empNavBtn}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Anterior"
            >
              ←
            </button>
            <div className={entrepreneursStyles.empNavDots}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${entrepreneursStyles.empNavDot} ${i === page ? entrepreneursStyles.empNavDotActive : ''}`}
                  onClick={() => setPage(i)}
                  aria-label={`Página ${i + 1}`}
                />
              ))}
            </div>
            <button
              className={entrepreneursStyles.empNavBtn}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        )}

        <div className={entrepreneursStyles.empCta}>
          <div>
            <h3 className={entrepreneursStyles.empCtaTitle}>¿Tienes un emprendimiento?</h3>
            <p className={entrepreneursStyles.empCtaText}>
              Únete a nuestra red, accede a ferias y amplía la visibilidad de tu negocio local en Guanacaste.
            </p>
          </div>
          <button className={entrepreneursStyles.empCtaBtn} onClick={onRegisterClick}>
            Registrarme →
          </button>
        </div>
      </div>

      <EntrepreneurDetailsModal
        entrepreneur={selectedEntrepreneur}
        show={isModalOpen}
        onClose={closeDetails}
      />
    </section>
  );
};

export default Entrepreneurs;