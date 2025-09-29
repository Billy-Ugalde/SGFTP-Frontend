import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useEntrepreneurs, useEntrepreneurById } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import type { Entrepreneur } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import { useQueryClient } from '@tanstack/react-query';

interface Props { subtitle?: string }
type AnyObj = Record<string, any>;

/* ====================== Config & helpers ====================== */
const API_BASE: string =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE__) ||
  'http://localhost:3001';

/** OFF por defecto para no generar 404. Actívalo con VITE_TRY_IMAGE_ENDPOINTS=true si tu backend expone esos endpoints. */
const TRY_IMAGE_ENDPOINTS: boolean =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_TRY_IMAGE_ENDPOINTS === 'true') ||
  (typeof window !== 'undefined' && (window as any).__TRY_IMAGE_ENDPOINTS__ === true);

const biz = (src: AnyObj) => src?.entrepreneurship ?? src?.emprendimiento ?? {};
const safe = (v: any) => (v === null || v === undefined || v === '' ? '—' : String(v));

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
type PhoneDetailed = { number: string; type?: 'business'|'personal'|'home'|'other'; is_primary?: boolean };

const toPhone = (x: any): PhoneDetailed | null => {
  if (!x) return null;
  if (typeof x === 'string') {
    const s = x.trim(); if (!s) return null;
    return { number: s };
  }
  if (typeof x === 'object') {
    const number = String(x.number ?? x.numero ?? x.phone ?? x.telefono ?? x.celular ?? x.whatsapp ?? '').trim();
    if (!number) return null;
    const rawType = String(x.type ?? x.tipo ?? '').toLowerCase();
    const is_primary = Boolean(x.is_primary ?? x.principal ?? x.primary);
    let type: PhoneDetailed['type'];
    if (['business','negocio','work'].includes(rawType)) type = 'business';
    else if (['personal'].includes(rawType)) type = 'personal';
    else if (['home','casa'].includes(rawType)) type = 'home';
    else type = rawType ? 'other' : undefined;
    return { number, type, is_primary };
  }
  return null;
};

const collectPhones = (src: AnyObj): PhoneDetailed[] => {
  const b = biz(src);
  const arrays = [src?.person?.phones, src?.phones, src?.telefonos, b?.phones, b?.telefonos]
    .filter(Array.isArray) as any[][];
  const singles = [
    src?.person?.phone, src?.person?.telefono, src?.person?.celular, src?.person?.whatsapp,
    src?.phone, src?.telefono, src?.celular, src?.whatsapp, src?.contact_phone,
    b?.phone, b?.telefono, b?.celular, b?.whatsapp, b?.contact_phone,
  ];
  const out: PhoneDetailed[] = [];
  for (const arr of arrays) for (const it of arr) { const p = toPhone(it); if (p) out.push(p); }
  for (const one of singles) { const p = toPhone(one); if (p) out.push(p); }
  const seen = new Set<string>();
  return out.filter(p => { const k = p.number.replace(/\D/g,''); if (seen.has(k)) return false; seen.add(k); return true; });
};

const labelType = (t?: PhoneDetailed['type']) =>
  t === 'business' ? 'Negocio' : t === 'personal' ? 'Personal' : t === 'home' ? 'Casa' : t === 'other' ? 'Otro' : undefined;

const waHref = (src: AnyObj, defaultCC='506'): string => {
  const list = collectPhones(src);
  if (!list.length) return '';
  const primary = list.find(p => p.is_primary)?.number ?? list[0].number;
  const digits = primary.replace(/\D/g,'');
  const withCC = digits.length <= 8 ? `${defaultCC}${digits}` : digits;
  return `https://wa.me/${withCC}`;
};

/* ---------- Campos de negocio ---------- */
const getExperience = (src: AnyObj): string =>
  (src?.experience_years ?? src?.experience ?? src?.experiencia ?? '')?.toString?.() ?? '';
const getBizName        = (src: AnyObj) => biz(src)?.name ?? biz(src)?.nombre ?? '';
const getBizDescription = (src: AnyObj) => biz(src)?.description ?? biz(src)?.descripcion ?? '';
const getBizLocation    = (src: AnyObj) => biz(src)?.location ?? biz(src)?.ubicacion ?? '';
const getBizCategory    = (src: AnyObj) => biz(src)?.category ?? biz(src)?.categoria ?? '';
const getBizFocus = (src: AnyObj) => {
  const b = biz(src);
  const raw = b?.approach ?? b?.focus ?? b?.enfoque ?? '';
  const key = String(raw).toLowerCase();
  const MAP: Record<string, string> = { social: 'Social', cultural: 'Cultural', ambiental: 'Ambiental' };
  return MAP[key] ?? raw ?? '';
};

/* ---------- Imágenes ---------- */
const resolveUrl = (u: string): string => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const path = u.startsWith('/') ? u.slice(1) : u;
  return `${API_BASE.replace(/\/+$/,'')}/${path}`;
};

const looksLikeImagePath = (s: string) =>
  /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(s) || /^(uploads|images|img|files)\//i.test(s);

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
      if (['url','image','src','path','href','file','filename','filepath'].includes(k)) {
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
    src?.images, src?.imagenes, src?.fotos
  ].filter(x => x != null);

  const csv = bags
    .filter(x => typeof x === 'string')
    .flatMap((s: string) => s.split(',').map(s2 => s2.trim()).filter(Boolean));

  const arr = bags.filter(Array.isArray) as any[][];
  const fromArrays = arr.flatMap(a => a.flatMap((x: any) => {
    if (typeof x === 'string') return [x];
    if (typeof x === 'object') {
      const cand = x.url ?? x.image ?? x.src ?? x.path ?? x.href ?? x.file ?? x.filename ?? x.filepath ?? '';
      return cand ? [cand] : [];
    }
    return [];
  }));

  const singles = [b?.image, b?.image1, b?.image2, b?.image3, b?.cover, b?.portada].filter(Boolean) as string[];

  const deep = deepCollectImageStrings(src);

  const raw = [...csv, ...fromArrays, ...singles, ...deep]
    .map(s => s?.toString?.().trim?.()).filter(Boolean) as string[];

  const abs = raw.map(resolveUrl);
  return Array.from(new Set(abs)).filter(looksLikeImagePath).slice(0, 3);
};

const fetchImagesByKnownEndpoints = async (id?: number | string): Promise<string[]> => {
  if (!id) return [];
  const endpoints = [
    `${API_BASE.replace(/\/+$/,'')}/entrepreneurs/${id}/images`,
    `${API_BASE.replace(/\/+$/,'')}/entrepreneurships/${id}/images`,
    `${API_BASE.replace(/\/+$/,'')}/files/entrepreneurs/${id}`,
  ];
  for (const url of endpoints) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.images) ? data.images : []);
      const urls = (list as any[]).flatMap(x => typeof x === 'string' ? [x] : [x?.url, x?.image, x?.src, x?.path, x?.file]).filter(Boolean);
      const abs = urls.map((u: string) => resolveUrl(String(u)));
      const uniques = Array.from(new Set(abs)).filter(looksLikeImagePath).slice(0, 3);
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
  focus: string;
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
      if (!TRY_IMAGE_ENDPOINTS) { setExtra([]); return; }  // evita 404 si no existen endpoints
      if (primary.length) { setExtra([]); return; }
      const urls = await fetchImagesByKnownEndpoints(numericId);
      if (mounted) setExtra(urls);
    })();
    return () => { mounted = false; };
  }, [numericId, primary.length]);

  const fallbackList = useMemo(() => (data.listImages ?? []).map(resolveUrl), [data.listImages]);

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
    <article className="entrepreneurs-card" onMouseEnter={() => onPrefetch?.((data.raw as any).id_entrepreneur)}>
      {/* Header SOLO imagen con cover */}
      <div
        className="entrepreneurs-card__top"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#0e5b4f',
          width: '100%',
          aspectRatio: '16 / 6',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {!!images.length && (
          <img
            key={slide}
            src={images[slide]}
            alt={`${data.name} - imagen ${slide + 1}`}
            className="entrepreneurs-card__hero"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }}
          />
        )}
      </div>

      {/* Body */}
      <div className="entrepreneurs-card__body">
        {data.category && <span className="entrepreneurs-chip">{data.category}</span>}
        <h3 className="entrepreneurs-card__subtitle">{data.name}</h3>

        {/* ====== NUEVO: meta compacta (ubicación / emprendedor) ====== */}
        {(data.location || data.person) && (
          <div className="entrepreneurs-meta">
            {data.location && (
              <span className="entrepreneurs-meta__item" title={`Ubicación: ${data.location}`}>
                📍 {data.location}
              </span>
            )}
            {data.person && (
              <span className="entrepreneurs-meta__item" title={`Emprendedor(a): ${data.person}`}>
                👤 {data.person}
              </span>
            )}
          </div>
        )}
        {/* ============================================================ */}

        {data.desc && <p className="entrepreneurs-desc">{data.desc}</p>}

        <div className="entrepreneurs-ctaRow">
          {data.wa && <a className="entrepreneurs-cta" href={data.wa} target="_blank" rel="noreferrer">WhatsApp</a>}
          {data.email && <a className="entrepreneurs-cta" href={`mailto:${data.email}`}>Email</a>}
          <button className="entrepreneurs-card__btn" onClick={() => onOpen(data.raw)}>Ver Detalles</button>
        </div>
      </div>
    </article>
  );
}

/* ================= Modal (idéntico admin) ================= */
function AdminLikeDetail({ ent }: { ent: AnyObj }) {
  const name = fullName(ent);
  const email = getEmail(ent);
  const expYears = getExperience(ent);
  const location = getBizLocation(ent);
  const focus = getBizFocus(ent);
  const category = getBizCategory(ent);
  const bizName = getBizName(ent);
  const desc = getBizDescription(ent);
  const createdAt = (ent as any).created_at ?? (ent as any).createdAt ?? '';
  const phones = collectPhones(ent);
  const images = getBizImagesFromObject(ent);

  // === NUEVO: helpers redes para estilo igual a admin ===
  const fbUrlRaw =
    ent?.facebook_url ?? ent?.facebook ?? ent?.social?.facebook ?? ent?.entrepreneur?.facebook_url ?? '';
  const igUrlRaw =
    ent?.instagram_url ?? ent?.instagram ?? ent?.social?.instagram ?? ent?.entrepreneur?.instagram_url ?? '';

  const withHttp = (u?: string) => {
    if (!u) return '';
    const s = String(u).trim();
    if (!s) return '';
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  };
  const fbUrl = withHttp(fbUrlRaw);
  const igUrl = withHttp(igUrlRaw);

  const socialBox: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    background: '#fff',
    width: '100%',
    color: '#111827',
    textDecoration: 'none',
    lineHeight: 1.2,
  };
  const iconWrap: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: '#f3f4f6',
  };

  return (
    <div className="ent-modal__body">
      <h2 className="ent-modal__name">{name}</h2>

      <section className="ent-block">
        <h4 className="ent-block__title">Datos Personales</h4>
        <div className="ent-grid ent-grid--3">
          <div className="ent-field">
            <span className="ent-field__label">Email</span>
            <div className="ent-field__value">{safe(email)}</div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Teléfonos</span>
            <div className="ent-field__value">
              {phones.length === 0 && '—'}
              {phones.map((p, i) => (
                <div key={i} style={{ marginBottom: i === phones.length - 1 ? 0 : 8 }}>
                  {p.number} {labelType(p.type) ? `(${labelType(p.type)})` : ''}{p.is_primary ? ' ⭐' : ''}
                </div>
              ))}
            </div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Años de experiencia</span>
            <div className="ent-field__value">{safe(expYears)}</div>
          </div>
        </div>
      </section>

      {/* === NUEVO: Redes Sociales con apariencia de admin === */}
      {(fbUrl || igUrl) && (
        <section className="ent-block">
          <h4 className="ent-block__title">Redes Sociales</h4>
          <div className="ent-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="ent-field">
              <span className="ent-field__label">Facebook</span>
              <div className="ent-field__value">
                {fbUrl ? (
                  <a href={fbUrl} target="_blank" rel="noreferrer" style={socialBox}>
                    <span style={{ ...iconWrap, background: '#e8f0fe' }}>
                      {/* FB */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
                        <path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07C2 17.08 5.66 21.22 10.44 22v-7.02H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.22.2 2.22.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54v1.86h2.74l-.44 2.91h-2.3V22C18.34 21.22 22 17.08 22 12.07z"/>
                      </svg>
                    </span>
                    <span>Facebook</span>
                  </a>
                ) : '—'}
              </div>
            </div>

            <div className="ent-field">
              <span className="ent-field__label">Instagram</span>
              <div className="ent-field__value">
                {igUrl ? (
                  <a href={igUrl} target="_blank" rel="noreferrer" style={socialBox}>
                    <span style={{ ...iconWrap, background: '#ffe4ec' }}>
                      {/* IG */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#E1306C" aria-hidden>
                        <path d="M7 2h10c2.76 0 5 2.24 5 5v10c0 2.76-2.24 5-5 5H7c-2.76 0-5-2.24-5-5V7c0-2.76 2.24-5 5-5zm0 2c-1.65 0-3 1.35-3 3v10c0 1.65 1.35 3 3 3h10c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3H7zm5 3.5A5.5 5.5 0 1112 18.5 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5zM18 6.25a1.25 1.25 0 11-1.25 1.25A1.25 1.25 0 0118 6.25z"/>
                      </svg>
                    </span>
                    <span>Instagram</span>
                  </a>
                ) : '—'}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="ent-block">
        <h4 className="ent-block__title">Detalles del Emprendimiento</h4>
        <div className="ent-grid ent-grid--3">
          <div className="ent-field">
            <span className="ent-field__label">Nombre</span>
            <div className="ent-field__value">{safe(bizName)}</div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Descripción</span>
            <div className="ent-field__value">{safe(desc)}</div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Ubicación</span>
            <div className="ent-field__value">{safe(location)}</div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Categoría</span>
            <div className="ent-field__value">
              <span className="ent-pill"><span className="ent-pill__emoji">✨</span>{safe(category)}</span>
            </div>
          </div>
          <div className="ent-field">
            <span className="ent-field__label">Enfoque</span>
            <div className="ent-field__value">{safe(focus)}</div>
          </div>
        </div>
      </section>

      <section className="ent-block">
        <h4 className="ent-block__title">Imágenes del Emprendimiento</h4>
        <div className="ent-images">
          {[0,1,2].map((i) => {
            const src = images[i];
            return (
              <div key={i} className={`ent-image ${src ? '' : 'ent-image--empty'}`}>
                {src ? <img src={src} alt={`Imagen ${i+1}`} /> : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="ent-footer-note">
        {createdAt ? `Fecha de registro: ${new Date(createdAt).toLocaleString()}` : ''}
      </div>
    </div>
  );
}

/* ================= Contenedor principal ================= */
const Entrepreneurs: React.FC<Props> = ({ subtitle }) => {
  const { data, isLoading, error } = useEntrepreneurs();

  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<Entrepreneur | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: selectedFull, isLoading: loadingDetail } = useEntrepreneurById(selectedId ?? undefined);
  const queryClient = useQueryClient();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDetail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetails(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDetail]);

  const openDetails = (e: Entrepreneur) => { setSelected(e); setSelectedId(e.id_entrepreneur!); setOpenDetail(true); };
  const closeDetails = () => { setOpenDetail(false); setSelected(null); setSelectedId(null); };

  const active = useMemo(() => {
    const list = data ?? [];
    return list.filter((e: Entrepreneur) =>
      isApproved(e) && (e as any).is_active !== false && !!(e as any).entrepreneurship
    );
  }, [data]);

  const scroll = (dir: 'prev' | 'next') => {
    const track = trackRef.current; if (!track) return;
    const step = Math.round(track.clientWidth * 0.9);
    track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  if (isLoading) return (
    <section className="entrepreneurs-shell">
      <div className="section">
        <h2 className="section-title">Emprendedores Locales</h2>
        <p className="entrepreneurs-subtitle">Cargando…</p>
      </div>
    </section>
  );

  if (error) return (
    <section className="entrepreneurs-shell">
      <div className="section">
        <h2 className="section-title">Emprendedores Locales</h2>
        <p className="entrepreneurs-subtitle">Ocurrió un error al cargar los emprendimientos.</p>
      </div>
    </section>
  );

  if (active.length === 0) return (
    <section className="entrepreneurs-shell">
      <div className="section">
        <h2 className="section-title">Emprendedores Locales</h2>
        <p className="entrepreneurs-subtitle">Pronto agregaremos nuevos emprendedores.</p>
      </div>
    </section>
  );

  const cards = active.map((e) => {
    const datum = {
      id: (e as any).id_entrepreneur ?? (e as any).id,
      raw: e,
      category: getBizCategory(e),
      name: getBizName(e),
      person: fullName(e),
      desc: getBizDescription(e),
      email: getEmail(e),
      location: getBizLocation(e),
      focus: getBizFocus(e),
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
              const res = await fetch(`${API_BASE.replace(/\/+$/,'')}/entrepreneurs/${id}`);
              if (!res.ok) throw new Error('Prefetch failed');
              return res.json();
            },
            staleTime: 5 * 60 * 1000,
          });
        }}
      />
    );
  });

  // Placeholders para mantener 3 columnas como en Ferias
  const placeholders = Math.max(0, 3 - cards.length);
  const ghost = Array.from({ length: placeholders }).map((_, i) => (
    <div
      key={`ghost-${i}`}
      className="entrepreneurs-card"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    />
  ));

  return (
    <section className="entrepreneurs-shell" id="emprendedores">
      <div className="section">
        <h2 className="section-title">Emprendedores Locales</h2>
        <p className="entrepreneurs-subtitle">{subtitle ?? ""}</p>

        {/* <=3: grid fijo de 3 columnas, alineado a la izquierda */}
        {cards.length <= 3 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(320px, 1fr))',
              gap: 24,
              marginTop: 28,
            }}
          >
            {cards}
            {ghost}
          </div>
        )}

        {/* >3: carrusel */}
        {cards.length > 3 && (
          <div className="entrepreneurs-carousel">
            <button
              aria-label="Anterior"
              className="entrepreneurs-carousel__btn entrepreneurs-carousel__btn--prev"
              onClick={() => scroll('prev')}
            >
              ‹
            </button>
            <div className="entrepreneurs-carousel__track" ref={trackRef}>
              {cards}
            </div>
            <button
              aria-label="Siguiente"
              className="entrepreneurs-carousel__btn entrepreneurs-carousel__btn--next"
              onClick={() => scroll('next')}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {openDetail && (() => {
        const ent: AnyObj = (selectedFull as any) ?? (selected as any) ?? {};
        const closeIfOverlay = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) closeDetails(); };
        return (
          <div className="ent-modal__overlay" role="dialog" aria-modal="true" onClick={closeIfOverlay}>
            <div className="ent-modal">
              <header className="ent-modal__header">
                <h3 className="ent-modal__title">Detalles del Emprendedor</h3>
                <button className="ent-modal__close" onClick={closeDetails} aria-label="Cerrar">×</button>
              </header>
              {loadingDetail ? <div className="ent-modal__body">Cargando detalle…</div> : <AdminLikeDetail ent={ent} />}
            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default Entrepreneurs;
