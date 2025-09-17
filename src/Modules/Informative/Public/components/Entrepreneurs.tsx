import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useEntrepreneurs, useEntrepreneurById } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import type { Entrepreneur } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import { useQueryClient } from '@tanstack/react-query';
import AddEntrepreneurButton from '../../../Entrepreneurs/Components/AddEntrepreneurButton';

type AnyObj = Record<string, any>;
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

const getPhones = (src: AnyObj): string[] => {
  const b = biz(src);
  const listCandidates = [
    ...(src?.person?.phones ?? []),
    ...(src?.phones ?? []),
    ...(src?.telefonos ?? []),
    ...(b?.phones ?? []),
    ...(b?.telefonos ?? []),
  ];
  const singleCandidates = [
    src?.person?.phone, src?.person?.telefono, src?.person?.celular, src?.person?.whatsapp,
    src?.phone, src?.telefono, src?.celular, src?.whatsapp, src?.contact_phone,
    b?.phone, b?.telefono, b?.celular, b?.whatsapp, b?.contact_phone,
  ];
  const values: string[] = [];
  for (const ph of listCandidates) {
    if (!ph) continue;
    if (typeof ph === 'string') { const v = ph.trim(); if (v) values.push(v); continue; }
    const n = ph.number ?? ph.telefono ?? ph.phone ?? ph.valor ?? ph.value ?? '';
    const t = ph.type ?? ph.label ?? ph.tag ?? '';
    if (n) values.push(`${n}${t ? ` (${t})` : ''}`.trim());
  }
  for (const one of singleCandidates) if (typeof one === 'string' && one.trim()) values.push(one.trim());
  return Array.from(new Set(values)).filter(Boolean);
};

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
  const MAP: Record<string, string> = {
    social: 'Social',
    cultural: 'Cultural',
    ambiental: 'Ambiental',
  };
  return MAP[key] ?? raw ?? '';
};

const getBizImages = (src: AnyObj): string[] => {
  const b = biz(src);

  const fromList = (Array.isArray(b?.images ?? b?.imagenes ?? b?.fotos)
    ? (b?.images ?? b?.imagenes ?? b?.fotos)
    : []
  )
    .map((x: any) => (typeof x === 'string' ? x : x?.url || x?.src || ''))
    .filter(Boolean);


  const fromFields = [b?.url_1, b?.url_2, b?.url_3].filter(Boolean).map(String);

  return [...fromList, ...fromFields].slice(0, 6);
};

const getSocials = (src: AnyObj) => {
  const b = biz(src);
  const urls = [
    src?.facebook_url, src?.instagram_url,
    b?.url_1, b?.url_2, b?.url_3,
    b?.facebook, b?.instagram,
    src?.facebook, src?.instagram,
  ].filter(Boolean).map(String);
  const instagram = urls.find(u => u.toLowerCase().includes('instagram.com')) || '';
  const facebook  = urls.find(u => u.toLowerCase().includes('facebook.com'))  || '';
  return { instagram, facebook, all: urls };
};

const CATEGORY_ICON: Record<string, string> = {
  Artesanía: '🏺', Artesania: '🏺', Gastronomía: '🍽️', Gastronomia: '🍽️', Comida: '🍲',
  Textil: '🧵', Vestimenta: '👗', Servicios: '🛠️', Tecnología: '💻', Tecnologia: '💻',
  Social: '🤝', Agricultura: '🌿',
};
const iconFor = (cat?: string) => CATEGORY_ICON[(cat ?? '').trim()] || '✨';
const safe = (v: any) => (v === null || v === undefined || v === '' ? '—' : String(v));


const Entrepreneurs: React.FC = () => {
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

  const openDetails = (e: Entrepreneur) => {
    setSelected(e); 
    setSelectedId(e.id_entrepreneur!);
    setOpenDetail(true);
  };
  const closeDetails = () => {
    setOpenDetail(false);
    setSelected(null);
    setSelectedId(null);
  };

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

  if (isLoading) {
    return (
      <section className="entrepreneurs-shell">
        <div className="section">
          <h2 className="section-title">Emprendedores Locales</h2>
          <p className="entrepreneurs-subtitle">Cargando…</p>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="entrepreneurs-shell">
        <div className="section">
          <h2 className="section-title">Emprendedores Locales</h2>
          <p className="entrepreneurs-subtitle">Ocurrió un error al cargar los emprendimientos.</p>
        </div>
      </section>
    );
  }
  if (active.length === 0) {
    return (
      <section className="entrepreneurs-shell">
        <div className="section">
          <h2 className="section-title">Emprendedores Locales</h2>
          <p className="entrepreneurs-subtitle">Pronto agregaremos nuevos emprendedores.</p>
        </div>
      </section>
    );
  }

  const cards = active.map((e) => {
    const category = getBizCategory(e);
    const name = getBizName(e);
    const desc = getBizDescription(e);
    const person = fullName(e);
    const phones = getPhones(e);
    const wa = phones[0] ? `https://wa.me/${phones[0].replace(/\D/g, '')}` : '';
    const socials = getSocials(e);
    const email = getEmail(e);

    return (
      <article
        className="entrepreneurs-card"
        key={(e as any).id_entrepreneur ?? (e as any).id ?? `${name}-${Math.random()}`}
        onMouseEnter={() => {
          const id = (e as any).id_entrepreneur;
          if (!id) return;
          queryClient.prefetchQuery({
            queryKey: ['entrepreneurs', 'detail', id],
            queryFn: async () => {
              const res = await fetch(`http://localhost:3001/entrepreneurs/${id}`);
              if (!res.ok) throw new Error('Prefetch failed');
              return res.json();
            },
            staleTime: 5 * 60 * 1000,
          });
        }}
      >
        <div className="entrepreneurs-card__top">
          <h4 className="entrepreneurs-card__title">
            <span className="entrepreneurs-emoji">{iconFor(category)}</span> {category || 'Emprendimiento'}
          </h4>
        </div>

        <div className="entrepreneurs-card__body">
          <div className="entrepreneurs-card__chips">
            {category && <span className="entrepreneurs-chip">{category}</span>}
          </div>

          <h3 className="entrepreneurs-card__subtitle">{name}</h3>

          {person && (
            <p className="entrepreneurs-line">
              <strong>Emprendedor(a):</strong> {person}
            </p>
          )}

          {desc && <p className="entrepreneurs-desc">{desc}</p>}

          <div className="entrepreneurs-ctaRow">
            {wa && <a className="entrepreneurs-cta" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
            {socials.instagram && <a className="entrepreneurs-cta" href={socials.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {socials.facebook && <a className="entrepreneurs-cta" href={socials.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {email && <a className="entrepreneurs-cta" href={`mailto:${email}`}>Email</a>}
            <button className="entrepreneurs-card__btn" onClick={() => openDetails(e)}>
              Ver detalles
            </button>
          </div>
        </div>
      </article>
    );
  });

  return (
    <section className="entrepreneurs-shell" id="emprendedores">
      <div className="section">

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <AddEntrepreneurButton />
        </div>
        <h2 className="section-title">Emprendedores Locales</h2>
        <p className="entrepreneurs-subtitle"></p>

        {active.length === 1 && (
          <div className="entrepreneurs-shell__inner--single">
            <div className="entrepreneurs-grid">{cards}</div>
          </div>
        )}

        {active.length > 1 && active.length <= 3 && <div className="entrepreneurs-grid">{cards}</div>}

        {active.length > 3 && (
          <div className="entrepreneurs-carousel">
            <button aria-label="Anterior" className="entrepreneurs-carousel__btn entrepreneurs-carousel__btn--prev" onClick={() => scroll('prev')}>‹</button>
            <div className="entrepreneurs-carousel__track" ref={trackRef}>{cards}</div>
            <button aria-label="Siguiente" className="entrepreneurs-carousel__btn entrepreneurs-carousel__btn--next" onClick={() => scroll('next')}>›</button>
          </div>
        )}
      </div>

      {/* ===== Modal ===== */}
      {openDetail && selected && (() => {
        const ent = selectedFull ?? selected; 
        const images = getBizImages(ent);
        const email = getEmail(ent);
        const phones = getPhones(ent);
        const expYears = getExperience(ent);
        const location = getBizLocation(ent);
        const focus = getBizFocus(ent);
        const category = getBizCategory(ent);
        const bizName = getBizName(ent);
        const desc = getBizDescription(ent);
        const createdAt = (ent as any).created_at ?? (ent as any).createdAt ?? '';

        const closeIfOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) closeDetails();
        };

        return (
          <div className="ent-modal__overlay" role="dialog" aria-modal="true" onClick={closeIfOverlay}>
            <div className="ent-modal">
              <header className="ent-modal__header">
                <h3 className="ent-modal__title">Detalles del Emprendedor</h3>
                <button className="ent-modal__close" onClick={closeDetails} aria-label="Cerrar">×</button>
              </header>

              <div className="ent-modal__body">
                <h2 className="ent-modal__name">{fullName(ent)}</h2>

                {loadingDetail && <p style={{marginTop: 8}}>Cargando detalle…</p>}

                <section className="ent-block">
                  <h4 className="ent-block__title">Datos Personales</h4>
                  <div className="ent-grid ent-grid--3">
                    <div className="ent-field">
                      <span className="ent-field__label">Email</span>
                      <div className="ent-field__value">{safe(email)}</div>
                    </div>
                    <div className="ent-field">
                      <span className="ent-field__label">Teléfonos</span>
                      <div className="ent-field__value">{phones.length ? phones.join(' • ') : '—'}</div>
                    </div>
                    <div className="ent-field">
                      <span className="ent-field__label">Experiencia (años)</span>
                      <div className="ent-field__value">{safe(expYears)}</div>
                    </div>
                  </div>
                </section>

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
                        <span className="ent-pill">
                          <span className="ent-pill__emoji">{iconFor(category)}</span> {safe(category)}
                        </span>
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
                    {images.length === 0 ? (
                      <>
                        <div className="ent-image ent-image--empty" />
                        <div className="ent-image ent-image--empty" />
                        <div className="ent-image ent-image--empty" />
                      </>
                    ) : (
                      images.map((src, i) => (
                        <div className="ent-image" key={i}>
                          <img src={src} alt={`Imagen ${i + 1} del emprendimiento`} />
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <div className="ent-footer-note">
                  {createdAt ? `Fecha de registro: ${new Date(createdAt).toLocaleString()}` : ''}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default Entrepreneurs;
