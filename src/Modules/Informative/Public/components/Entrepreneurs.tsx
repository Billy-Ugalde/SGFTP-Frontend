import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntrepreneurs, useEntrepreneurById } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import type { Entrepreneur } from '../../../Entrepreneurs/Types';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../../config/env';
import EntrepreneurDetailsModal from '../../../Entrepreneurs/Components/EntrepreneurDetailsModal';
import entrepreneursStyles from '../styles/Entrepreneurs.module.css';
import { buildWhatsAppUrl } from '../../../../shared/utils/phone.utils';

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

function EntrepreneurPublicCard({
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
        {data.category && (
          <span className={entrepreneursStyles.entrepreneursChip}>{data.category}</span>
        )}
        {images.length > 0 ? (
          <img
            key={slide}
            src={images[slide]}
            alt={`${data.name} - imagen ${slide + 1}`}
            className={entrepreneursStyles.entrepreneursCardHero}
            crossOrigin="anonymous"
          />
        ) : (
          <span>🌿</span>
        )}
      </div>

      <div className={entrepreneursStyles.entrepreneursCardBody}>
        <div className={entrepreneursStyles.entrepreneursCardContent}>
          <h3 className={entrepreneursStyles.entrepreneursCardSubtitle}>{data.name}</h3>

          {(data.location || data.person) && (
            <div className={entrepreneursStyles.empLoc}>
              {data.location
                ? `📍 ${data.location}${data.person ? ` · ${data.person}` : ''}`
                : `👤 ${data.person}`}
            </div>
          )}

          {data.desc && <p className={entrepreneursStyles.entrepreneursDesc}>{data.desc}</p>}
        </div>

        <div className={entrepreneursStyles.empRow}>
          {data.wa && (
            <a
              className={entrepreneursStyles.empIconBtn}
              href={data.wa}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Contactar por WhatsApp"
            >
              💬
            </a>
          )}
          {data.email && (
            <a
              className={entrepreneursStyles.empIconBtn}
              href={`mailto:${data.email}`}
              onClick={(e) => e.stopPropagation()}
              title="Enviar correo electrónico"
            >
              ✉️
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
const PER_PAGE = 3;

const Entrepreneurs: React.FC<Props> = ({ subtitle, onRegisterClick }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEntrepreneurs();

  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);

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
    return list.filter((e: Entrepreneur) =>
      isApproved(e) && (e as any).is_active !== false && !!(e as any).entrepreneurship
    );
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
        <p className={entrepreneursStyles.entrepreneursSubtitle}>{msg}</p>
      </div>
    </section>
  );

  if (isLoading) return <EmpHeader msg="Cargando…" />;
  if (error)     return <EmpHeader msg="Ocurrió un error al cargar los emprendimientos." />;
  if (active.length === 0) return <EmpHeader msg="Pronto agregaremos nuevos emprendedores." />;

  const totalPages = Math.ceil(active.length / PER_PAGE);
  const visibleActive = active.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const makeCard = (e: Entrepreneur) => {
    const datum = {
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