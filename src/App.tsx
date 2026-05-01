import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Clock,
  UtensilsCrossed,
  Star,
  Heart,
  Navigation,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Outfit', sans-serif;
    background: #0c0501;
    color: #f2e0cc;
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
    z-index: 0;
  }
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: -2;
    background:
      radial-gradient(ellipse 70% 50% at 5% 0%, rgba(255,90,0,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 95% 100%, rgba(200,50,0,0.09) 0%, transparent 60%),
      repeating-linear-gradient(-55deg,
        transparent 0px, transparent 44px,
        rgba(255,255,255,0.013) 44px, rgba(255,255,255,0.013) 45px);
    pointer-events: none;
  }
  img { display: block; max-width: 100%; }
  button { font-family: inherit; }
  a { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0c0501; }
  ::-webkit-scrollbar-thumb { background: rgba(255,120,30,0.4); border-radius: 99px; }
  .nav-link:hover { color: #ff9030 !important; }
  .menu-card:hover { border-color: rgba(255,120,30,0.5) !important; }
  .gallery-card:hover { border-color: rgba(255,120,30,0.5) !important; }
  @media (max-width: 900px) {
    .hide-mobile { display: none !important; }
    .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .about-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
    .visit-grid { grid-template-columns: 1fr !important; }
    .hero-section { padding: 24px 20px 32px !important; min-height: auto !important; }
    .section-pad { padding: 56px 20px !important; }
    .big-card { padding: 28px 20px !important; border-radius: 24px !important; }
    .menu-grid { grid-template-columns: 1fr 1fr !important; }
    .gallery-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .menu-grid { grid-template-columns: 1fr !important; }
    .gallery-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── DATA ──────────────────────────────────────
const R = {
  address: '607 Historic Hwy 165 Suite 7, Branson, MO 65616',
  phone1: '+1 417 365 8772',
  phone1Raw: '+14173658772',
  phone2: '+1 417 544 0281',
  phone2Raw: '+14175440281',
  maps: 'https://www.google.com/maps/search/?api=1&query=607+Historic+Hwy+165+Suite+7+Branson+MO+65616',
  tagline: {
    en: 'Authentic Salvadoran & Latin American Cuisine in Branson, Missouri',
    es: 'Cocina Salvadorena y Latinoamericana Autentica en Branson, Missouri',
  },
  desc: {
    en: 'Bringing the warm, comforting flavors of El Salvador to Branson -- handmade pupusas, traditional breakfasts, hearty broths, fresh tacos, family-style plates, desserts, and more.',
    es: 'Los calidos sabores de El Salvador llegan a Branson -- pupusas artesanales, desayunos tradicionales, caldos, tacos frescos, platos familiares, postres y mucho mas.',
  },
};

const HOURS = [
  { en: 'Monday - Saturday', es: 'Lunes - Sabado', time: '10:00 AM - 9:00 PM' },
  { en: 'Sunday', es: 'Domingo', time: '10:00 AM - 5:00 PM' },
];

const LOGO = 'https://i.imgur.com/ziFHLWt.jpeg';
const FOOD_HERO = 'https://i.imgur.com/P5pIXM6.png';

const MENU_EN = [
  { label: 'Appetizers', src: 'https://i.imgur.com/TdGThrD.jpeg' },
  { label: 'Pupusas', src: 'https://i.imgur.com/su1uMFd.jpeg' },
  { label: 'Enchiladas', src: 'https://i.imgur.com/HO4j04a.jpeg' },
  { label: 'Burritos', src: 'https://i.imgur.com/qR8YlRF.jpeg' },
  { label: 'Broths', src: 'https://i.imgur.com/28m7yb2.jpeg' },
  { label: 'Drinks', src: 'https://i.imgur.com/eZi1nwp.jpeg' },
  { label: 'Sides', src: 'https://i.imgur.com/d7FmDGJ.jpeg' },
  { label: 'House Dishes p.1', src: 'https://i.imgur.com/en9VhoR.jpeg' },
  { label: 'House Dishes p.2', src: 'https://i.imgur.com/dGH2Dpy.jpeg' },
  { label: 'Kids & Desserts', src: 'https://i.imgur.com/b8tKvCc.jpeg' },
  { label: 'Hours', src: 'https://i.imgur.com/eriaeaR.jpeg' },
];

const MENU_ES = [
  { label: 'Aperitivos', src: 'https://i.imgur.com/Y0pdYvY.jpeg' },
  { label: 'Pupusas', src: 'https://i.imgur.com/jd5Yu28.jpeg' },
  { label: 'Enchiladas', src: 'https://i.imgur.com/9ZLCPZ0.jpeg' },
  { label: 'Burritos', src: 'https://i.imgur.com/GRaUMKM.jpeg' },
  { label: 'Caldos', src: 'https://i.imgur.com/QpfLs2Q.jpeg' },
  { label: 'Bebidas', src: 'https://i.imgur.com/00bDY1n.jpeg' },
  { label: 'Acompanantes', src: 'https://i.imgur.com/mvPKucP.jpeg' },
  { label: 'Platos de Casa p.1', src: 'https://i.imgur.com/aditXKw.jpeg' },
  { label: 'Platos de Casa p.2', src: 'https://i.imgur.com/z8tv8CV.jpeg' },
  { label: 'Ninos y Postres', src: 'https://i.imgur.com/vpOSvaT.jpeg' },
  { label: 'Horario', src: 'https://i.imgur.com/pKXOoXw.jpeg' },
];

const GALLERY = [
  { src: 'https://i.imgur.com/tsIGIlD.jpeg', caption: 'Pupusa' },
  { src: 'https://i.imgur.com/IZo939t.jpeg', caption: 'Crazy Asada Fries' },
  { src: 'https://i.imgur.com/VTAdhep.jpeg', caption: 'Quesadilla' },
  { src: 'https://i.imgur.com/WTobCV8.jpeg', caption: 'Enchiladas' },
  { src: 'https://i.imgur.com/yM02Wnh.jpeg', caption: 'Torta' },
  { src: 'https://i.imgur.com/IvyFExW.jpeg', caption: 'Soup' },
  { src: 'https://i.imgur.com/YKvfcrZ.jpeg', caption: 'Dessert' },
];

const REVIEWS = [
  {
    name: 'Genevieve Smith',
    source: 'Google',
    text: "I've eaten their food many times and it's always delicious! Everything I've had is great, but I recommend the pupusas and platanos particularly. My family and I will be back often!",
  },
  {
    name: 'Kristen Tabor',
    source: 'Google',
    text: 'Outstanding food! Despite the humble exterior, really a fabulous dining experience. Especially enjoyed meeting Eric from Honduras and teammates from El Salvador. Truly delicious!!!',
  },
  {
    name: 'James Therrien',
    source: 'Google',
    text: 'Excellent food and service. I highly recommend this restaurant. The papusas were so good.',
  },
  {
    name: 'Erick Gonzalez',
    source: 'Google',
    text: 'The food is amazing. Fresh made at the moment. Will definitely go back!!!',
  },
  {
    name: 'Matt',
    source: 'Personal Favorite',
    highlight: true,
    text: 'My favorite place to eat at. Got the best tacos hands down. I love the Chorizo and El Pastor tacos myself. Mix the red and green sauce together with that lime!',
  },
];

// ── DESIGN TOKENS ─────────────────────────────
const C = {
  orange: '#ff8c20',
  orangeD: '#e85500',
  orangeDim: 'rgba(255,140,32,0.11)',
  border: 'rgba(255,140,32,0.22)',
  card: 'rgba(18,8,2,0.93)',
  muted: '#8a6848',
};
const gradText = {
  background: 'linear-gradient(130deg, #ff8c20 20%, #e85500 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// ── ANIMATION ─────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
};
function Reveal({ children, delay = 0, style = {}, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── BUTTONS ───────────────────────────────────
function Btn({
  href,
  onClick,
  children,
  target,
  variant = 'primary',
  style: extra = {},
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform .15s, box-shadow .15s',
    border: 'none',
    padding: '13px 26px',
  };
  const variants = {
    primary: {
      ...base,
      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
      color: '#fff',
      boxShadow: '0 6px 28px rgba(232,85,0,0.38)',
    },
    outline: {
      ...base,
      background: C.orangeDim,
      border: `2px solid rgba(255,140,32,0.4)`,
      color: '#ffb870',
    },
  };
  const s = { ...variants[variant], ...extra };
  const hi = (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 12px 36px rgba(232,85,0,0.48)';
  };
  const ho = (e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = variants[variant].boxShadow || '';
  };
  if (href)
    return (
      <a
        href={href}
        target={target}
        rel="noreferrer"
        style={s}
        onMouseEnter={hi}
        onMouseLeave={ho}
      >
        {children}
      </a>
    );
  return (
    <button style={s} onClick={onClick} onMouseEnter={hi} onMouseLeave={ho}>
      {children}
    </button>
  );
}

// ── SECTION HEADER ────────────────────────────
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 52px' }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.32em',
          color: 'rgba(255,140,32,0.65)',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(38px, 4.5vw, 58px)',
          lineHeight: 1.1,
          ...gradText,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            color: C.muted,
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.75,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── STAR ROW ──────────────────────────────────
function StarRow({ size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="#ff8c20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── LANGUAGE PICK MODAL ───────────────────────
function LangPickModal({ onPick, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(18,8,2,0.98)',
          border: `1px solid ${C.border}`,
          borderRadius: 32,
          padding: '40px 28px',
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}
      >
        <img
          src={LOGO}
          alt="Logo"
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            objectFit: 'cover',
            margin: '0 auto 22px',
            border: `2px solid ${C.border}`,
          }}
        />
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            color: C.orange,
            margin: '0 0 8px',
          }}
        >
          Choose Language
        </h3>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 36 }}>
          Which menu would you like to view?
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            onClick={() => onPick('en')}
            style={{
              flex: 1,
              padding: '20px 24px',
              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 6px 28px rgba(232,85,0,0.4)',
              transition: 'transform .15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = 'translateY(-2px)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
          >
            English
          </button>
          <button
            onClick={() => onPick('es')}
            style={{
              flex: 1,
              padding: '20px 24px',
              background: C.orangeDim,
              border: `2px solid rgba(255,140,32,0.4)`,
              color: '#ffb870',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 20,
              cursor: 'pointer',
              transition: 'transform .15s, background .2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255,140,32,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.background = C.orangeDim;
            }}
          >
            Espanol
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            background: 'none',
            border: 'none',
            color: C.muted,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── NAV ───────────────────────────────────────
function Nav({ lang, setLang, onMenuOpen }) {
  const go = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const links = [
    { id: 'about', en: 'About', es: 'Nosotros' },
    { id: 'menu', en: 'Menu', es: 'Menu' },
    { id: 'gallery', en: 'Gallery', es: 'Galeria' },
    { id: 'reviews', en: 'Reviews', es: 'Resenas' },
    { id: 'visit', en: 'Visit', es: 'Visitanos' },
  ];
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(12,5,1,0.93)',
        backdropFilter: 'blur(22px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <button
        onClick={() => go('home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <img
          src={LOGO}
          alt="Logo"
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2.5px solid rgba(255,140,32,0.6)`,
            boxShadow: '0 0 22px rgba(255,100,0,0.32)',
            flexShrink: 0,
          }}
        />
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 17,
              color: C.orange,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Pupuseria El Amanecer
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>Branson, Missouri</div>
        </div>
      </button>

      <div
        className="hide-mobile"
        style={{ display: 'flex', gap: 24, alignItems: 'center' }}
      >
        {links.map((l) => (
          <button
            key={l.id}
            className="nav-link"
            onClick={() => (l.id === 'menu' ? onMenuOpen() : go(l.id))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#c09878',
              fontWeight: 600,
              fontSize: 14,
              transition: 'color .2s',
            }}
          >
            {l[lang]}
          </button>
        ))}
        <button
          onClick={() => setLang((p) => (p === 'en' ? 'es' : 'en'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: C.orangeDim,
            border: `1.5px solid rgba(255,140,32,0.35)`,
            borderRadius: 999,
            padding: '6px 14px',
            color: C.orange,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,140,32,0.22)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = C.orangeDim)}
        >
          <Globe size={13} /> {lang === 'en' ? 'Espanol' : 'English'}
        </button>
      </div>

      <a
        href={`tel:${R.phone1Raw}`}
        style={{
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
          color: '#fff',
          borderRadius: 999,
          padding: '10px 22px',
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(232,85,0,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        {lang === 'en' ? 'Call Now' : 'Llamar'}
      </a>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────
function Hero({ lang, onMenuOpen }) {
  return (
    <section
      id="home"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${LOGO})`,
          backgroundSize: '48%',
          backgroundPosition: 'right 2% center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.055,
          filter: 'saturate(0.3) blur(1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(108deg, rgba(12,5,1,0.98) 40%, rgba(12,5,1,0.45) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-18%',
          left: '-8%',
          zIndex: 0,
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,90,0,0.13) 0%, transparent 70%)',
          filter: 'blur(72px)',
        }}
      />

      <div
        className="hero-section hero-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1240,
          margin: '0 auto',
          padding: '32px 40px 40px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 60,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(52px, 6.5vw, 88px)',
              lineHeight: 1.0,
              color: '#fff',
              margin: 0,
              fontWeight: 700,
            }}
          >
            Pupuseria <span style={gradText}>El Amanecer</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              fontWeight: 500,
              color: '#e0c4a4',
              margin: '22px 0 13px',
              lineHeight: 1.5,
            }}
          >
            {R.tagline[lang]}
          </p>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.9,
              color: C.muted,
              maxWidth: 500,
            }}
          >
            {R.desc[lang]}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 13,
              marginTop: 36,
              flexWrap: 'wrap',
              maxWidth: '100%',
            }}
          >
            <Btn onClick={onMenuOpen}>
              <UtensilsCrossed size={17} />
              {lang === 'en' ? 'View Full Menu' : 'Ver Menu Completo'}
            </Btn>
            <Btn variant="outline" href={R.maps} target="_blank">
              <Navigation size={17} />
              {lang === 'en' ? 'Get Directions' : 'Como Llegar'}
            </Btn>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: 44,
                background: 'rgba(255,100,0,0.09)',
                filter: 'blur(38px)',
                zIndex: -1,
              }}
            />
            <div
              style={{
                background: 'rgba(16,7,1,0.9)',
                border: `1px solid ${C.border}`,
                borderRadius: 34,
                padding: 18,
                boxShadow: '0 44px 100px rgba(0,0,0,0.72)',
              }}
            >
              <img
                src={FOOD_HERO}
                alt="Pupuseria El Amanecer"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 22,
                  display: 'block',
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 9,
                  marginTop: 12,
                }}
              >
                {[
                  [
                    lang === 'en' ? 'Known For' : 'Conocido Por',
                    lang === 'en' ? 'Pupusas' : 'Pupusas',
                  ],
                  [
                    lang === 'en' ? 'Style' : 'Estilo',
                    lang === 'en' ? 'Family Food' : 'Comida Familiar',
                  ],
                  [lang === 'en' ? 'Location' : 'Ubicacion', 'Branson, MO'],
                ].map(([lbl, val]) => (
                  <div
                    key={lbl}
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.orangeDim,
                      borderRadius: 13,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: C.muted,
                      }}
                    >
                      {lbl}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.orange,
                        fontSize: 13,
                        marginTop: 3,
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── ABOUT ─────────────────────────────────────
function About({ lang }) {
  return (
    <section
      id="about"
      className="section-pad"
      style={{ padding: '90px 40px' }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <div
            className="about-grid big-card"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 44,
              padding: 60,
              boxShadow: '0 24px 80px rgba(0,0,0,0.52)',
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: 52,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                borderRadius: 26,
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
              }}
            >
              <img
                src={FOOD_HERO}
                alt="El Amanecer Food"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  color: 'rgba(255,140,32,0.65)',
                  marginBottom: 10,
                }}
              >
                {lang === 'en' ? 'Our Story' : 'Nuestra Historia'}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(30px,3vw,46px)',
                  lineHeight: 1.15,
                  ...gradText,
                  margin: 0,
                }}
              >
                {lang === 'en'
                  ? 'A warm taste of El Salvador.'
                  : 'El calido sabor de El Salvador.'}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.9,
                  color: C.muted,
                  marginTop: 18,
                }}
              >
                {lang === 'en'
                  ? 'Pupuseria El Amanecer brings the heart of Salvadoran cooking to Branson. Every dish from our golden handmade pupusas to rich broths and vibrant house plates is made with the care and tradition of home cooking. We welcome everyone to our table.'
                  : 'Pupuseria El Amanecer trae el corazon de la cocina salvadorena a Branson. Cada platillo desde nuestras pupusas artesanales hasta los caldos ricos y coloridos platos de la casa se elabora con el cuidado y la tradicion de la cocina casera.'}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 11,
                  marginTop: 28,
                }}
              >
                {[
                  [
                    <UtensilsCrossed size={19} color={C.orange} />,
                    lang === 'en' ? 'Fresh Daily' : 'Fresco Diario',
                  ],
                  [
                    <Heart size={19} color={C.orange} />,
                    lang === 'en' ? 'Family Comfort' : 'Comida Familiar',
                  ],
                  [
                    <Star size={19} color={C.orange} />,
                    lang === 'en' ? 'Salvadoran Roots' : 'Raices Salvadorenas',
                  ],
                ].map(([icon, lbl]) => (
                  <div
                    key={lbl}
                    style={{
                      background: C.orangeDim,
                      border: `1px solid ${C.border}`,
                      borderRadius: 17,
                      padding: 17,
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>{icon}</div>
                    <div
                      style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}
                    >
                      {lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── MENU VIEWER ───────────────────────────────
function MenuViewer({
  lang: siteLang,
  viewerOpen,
  onViewerOpen,
  onViewerClose,
  initLang,
  initPage,
}) {
  const [page, setPage] = useState(0);
  const [menuLang, setMenuLang] = useState(initLang || 'en');
  const touchStartX = useRef(null);

  useEffect(() => {
    if (viewerOpen) {
      if (initLang) setMenuLang(initLang);
      if (typeof initPage === 'number') setPage(initPage);
    }
  }, [viewerOpen, initLang, initPage]);

  const pages = menuLang === 'en' ? MENU_EN : MENU_ES;
  const total = pages.length;

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(
    () => setPage((p) => Math.min(total - 1, p + 1)),
    [total]
  );

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) next();
    if (dx > 50) prev();
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!viewerOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onViewerClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewerOpen, next, prev, onViewerClose]);

  return (
    <>
      <section
        id="menu"
        className="section-pad"
        style={{ padding: '90px 40px' }}
      >
        <SectionHead
          eyebrow={siteLang === 'en' ? 'Our Menu' : 'Nuestro Menu'}
          title={
            siteLang === 'en' ? 'Browse Our Full Menu' : 'Explora Nuestro Menu'
          }
          sub={
            siteLang === 'en'
              ? 'Choose English or Spanish, then swipe or use arrows to flip through every page.'
              : 'Elige ingles o espanol, luego desliza o usa las flechas para explorar cada pagina.'
          }
        />

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewerOpen}
            style={{
              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '28px 52px',
              cursor: 'pointer',
              boxShadow: '0 10px 48px rgba(232,85,0,0.42)',
              fontFamily: 'inherit',
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {siteLang === 'en' ? 'Open Full Menu' : 'Abrir Menu Completo'}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginTop: 8,
                opacity: 0.85,
              }}
            >
              {siteLang === 'en'
                ? 'English & Spanish - Swipe or use arrows'
                : 'Ingles y Espanol - Desliza o usa flechas'}
            </div>
          </motion.button>
        </div>

        {/* Thumbnail grid */}
        <div
          className="menu-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
            maxWidth: 1240,
            margin: '0 auto',
          }}
        >
          {MENU_EN.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.035}>
              <motion.div
                className="menu-card"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                onClick={() => onViewerOpen(siteLang === 'es' ? 'es' : 'en', i)}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
                  transition: 'border-color .2s',
                }}
              >
                <div
                  style={{
                    height: 175,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <img
                    src={siteLang === 'es' ? MENU_ES[i].src : item.src}
                    alt={item.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform .45s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = 'scale(1.05)')
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = 'scale(1)')
                    }
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(12,5,1,0.7) 0%, transparent 50%)',
                    }}
                  />
                </div>
                <div style={{ padding: '14px 18px 18px' }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 17,
                      color: C.orange,
                      fontWeight: 600,
                    }}
                  >
                    {siteLang === 'es' ? MENU_ES[i].label : item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {siteLang === 'en' ? 'Tap to view' : 'Toca para ver'}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full screen viewer */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0,0,0,0.96)',
              backdropFilter: 'blur(14px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20,
                    color: C.orange,
                    fontWeight: 600,
                  }}
                >
                  {pages[page].label}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {menuLang === 'en' ? 'English Menu' : 'Menu en Espanol'} -
                  Page {page + 1} of {total}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setMenuLang((l) => (l === 'en' ? 'es' : 'en'));
                    setPage(0);
                  }}
                  style={{
                    background: C.orangeDim,
                    border: `1px solid ${C.border}`,
                    borderRadius: 999,
                    padding: '7px 16px',
                    color: C.orange,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Globe size={13} />{' '}
                  {menuLang === 'en' ? 'Espanol' : 'English'}
                </button>
                <button
                  onClick={onViewerClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                maxWidth: 820,
                padding: '64px 16px 86px',
                position: 'relative',
              }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${menuLang}-${page}`}
                  src={pages[page].src}
                  alt={pages[page].label}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
                    border: `1px solid ${C.border}`,
                    objectFit: 'contain',
                    maxHeight: '70vh',
                  }}
                />
              </AnimatePresence>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '0 16px',
              }}
            >
              <button
                onClick={prev}
                disabled={page === 0}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    page === 0 ? 'rgba(255,255,255,0.06)' : C.orangeDim,
                  border: `1.5px solid ${
                    page === 0 ? 'rgba(255,255,255,0.1)' : C.border
                  }`,
                  color: page === 0 ? 'rgba(255,255,255,0.2)' : C.orange,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: 'calc(100% - 120px)',
                }}
              >
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      width: i === page ? 20 : 7,
                      height: 7,
                      borderRadius: 99,
                      background:
                        i === page ? C.orange : 'rgba(255,140,32,0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all .3s ease',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={page === total - 1}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    page === total - 1 ? 'rgba(255,255,255,0.06)' : C.orangeDim,
                  border: `1.5px solid ${
                    page === total - 1 ? 'rgba(255,255,255,0.1)' : C.border
                  }`,
                  color:
                    page === total - 1 ? 'rgba(255,255,255,0.2)' : C.orange,
                  cursor: page === total - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── GALLERY ───────────────────────────────────
function Gallery({ lang }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <section
      id="gallery"
      className="section-pad"
      style={{ padding: '90px 40px' }}
    >
      <SectionHead
        eyebrow={lang === 'en' ? 'Gallery' : 'Galeria'}
        title={
          lang === 'en' ? 'Food Worth Coming For' : 'Comida que Vale la Pena'
        }
        sub={
          lang === 'en'
            ? 'A look at some of the dishes we are proud to serve every day.'
            : 'Un vistazo a algunos de los platillos que nos enorgullece servir cada dia.'
        }
      />
      <div
        className="gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {GALLERY.map((item, i) => (
          <Reveal key={item.src} delay={i * 0.05}>
            <motion.div
              className="gallery-card"
              whileHover={{
                y: -5,
                boxShadow: '0 24px 64px rgba(255,100,0,0.22)',
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={() => setLightbox(i)}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 24,
                overflow: 'hidden',
                cursor: 'zoom-in',
                boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
                transition: 'border-color .2s',
              }}
            >
              <div
                style={{
                  height: 230,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform .5s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = 'scale(1.07)')
                  }
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(12,5,1,0.7) 0%, transparent 50%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 16,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18,
                    color: '#fff',
                    fontWeight: 600,
                    textShadow: '0 1px 8px rgba(0,0,0,0.7)',
                  }}
                >
                  {item.caption}
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              cursor: 'zoom-out',
            }}
          >
            <motion.div
              initial={{ scale: 0.87, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: 860,
                width: '100%',
                cursor: 'default',
              }}
            >
              <img
                src={GALLERY[lightbox].src}
                alt={GALLERY[lightbox].caption}
                style={{
                  width: '100%',
                  borderRadius: 22,
                  boxShadow: '0 44px 100px rgba(0,0,0,0.88)',
                  border: `1px solid ${C.border}`,
                  maxHeight: '78vh',
                  objectFit: 'contain',
                }}
              />
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                <X size={16} />
              </button>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => setLightbox((p) => p - 1)}
                  disabled={lightbox === 0}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background:
                      lightbox === 0
                        ? 'rgba(255,255,255,0.06)'
                        : `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                    border: 'none',
                    cursor: lightbox === 0 ? 'default' : 'pointer',
                    color: lightbox === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20,
                    color: C.orange,
                    fontWeight: 600,
                    textAlign: 'center',
                    flex: 1,
                  }}
                >
                  {GALLERY[lightbox].caption}
                </div>
                <button
                  onClick={() => setLightbox((p) => p + 1)}
                  disabled={lightbox === GALLERY.length - 1}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background:
                      lightbox === GALLERY.length - 1
                        ? 'rgba(255,255,255,0.06)'
                        : `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                    border: 'none',
                    cursor:
                      lightbox === GALLERY.length - 1 ? 'default' : 'pointer',
                    color:
                      lightbox === GALLERY.length - 1
                        ? 'rgba(255,255,255,0.2)'
                        : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── REVIEWS ───────────────────────────────────
function Reviews({ lang }) {
  return (
    <section
      id="reviews"
      className="section-pad"
      style={{ padding: '90px 40px' }}
    >
      <SectionHead
        eyebrow={
          lang === 'en'
            ? 'What People Are Saying'
            : 'Lo Que Dicen Nuestros Clientes'
        }
        title={
          lang === 'en'
            ? 'Real reviews. Real love.'
            : 'Resenas reales. Amor real.'
        }
        sub={
          lang === 'en'
            ? "Don't take our word for it -- here's what our guests have to say."
            : 'No lo decimos nosotros -- esto es lo que dicen nuestros clientes.'
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 22,
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.06}>
            <div
              style={{
                background: r.highlight
                  ? `linear-gradient(145deg, rgba(255,140,32,0.14), rgba(232,85,0,0.08))`
                  : C.card,
                border: `1px solid ${
                  r.highlight ? 'rgba(255,140,32,0.45)' : C.border
                }`,
                borderRadius: 26,
                padding: '28px 28px 24px',
                boxShadow: r.highlight
                  ? '0 8px 40px rgba(255,100,0,0.18)'
                  : '0 8px 30px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 20,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 80,
                  lineHeight: 1,
                  color: 'rgba(255,140,32,0.12)',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                &ldquo;
              </div>
              <StarRow />
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: r.highlight ? '#f2e0cc' : '#c8a888',
                  fontStyle: 'italic',
                  marginBottom: 20,
                  flex: 1,
                }}
              >
                &ldquo;{r.text}&rdquo;
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 'auto',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(232,85,0,0.35)',
                  }}
                >
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: r.highlight ? C.orange : C.muted,
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    {r.highlight ? 'Personal Favorite' : 'Google Review'}{' '}
                    &middot; 5 Stars
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} style={{ marginTop: 44 }}>
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                color: C.orange,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              5.0
            </div>
            <StarRow size={18} />
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
              {lang === 'en'
                ? 'Rated on Google Reviews'
                : 'Calificado en Google Reviews'}
            </div>
          </div>
          <div style={{ width: 1, height: 60, background: C.border }} />
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28,
                color: '#fff',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {lang === 'en'
                ? 'Come taste for yourself.'
                : 'Ven a probarlo tu mismo.'}
            </div>
            <a
              href={`tel:${R.phone1Raw}`}
              style={{
                display: 'inline-block',
                marginTop: 12,
                background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                color: '#fff',
                borderRadius: 999,
                padding: '9px 22px',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(232,85,0,0.38)',
              }}
            >
              {lang === 'en' ? 'Call to Order' : 'Llamar para Ordenar'}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── VISIT ─────────────────────────────────────
function Visit({ lang }) {
  const card = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 44,
    padding: 52,
    boxShadow: '0 24px 80px rgba(0,0,0,0.52)',
  };
  const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: C.orangeDim,
    border: `1px solid ${C.border}`,
    borderRadius: 17,
    padding: '16px 20px',
  };
  return (
    <section
      id="visit"
      className="section-pad"
      style={{ padding: '90px 40px' }}
    >
      <SectionHead
        eyebrow={lang === 'en' ? 'Find Us' : 'Encuentranos'}
        title={lang === 'en' ? 'Hours & Contact' : 'Horario y Contacto'}
      />
      <div
        className="visit-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        <Reveal>
          <div className="big-card" style={card}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'rgba(255,140,32,0.65)',
                marginBottom: 10,
              }}
            >
              {lang === 'en' ? 'Open Hours' : 'Horario'}
            </p>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(26px,2.8vw,40px)',
                lineHeight: 1.2,
                ...gradText,
                margin: '0 0 28px',
              }}
            >
              {lang === 'en'
                ? 'We are open all week.'
                : 'Abiertos toda la semana.'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {HOURS.map((h) => (
                <div key={h.en} style={row}>
                  <Clock size={19} color={C.orange} style={{ flexShrink: 0 }} />
                  <span
                    style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}
                  >
                    {h[lang]}
                  </span>
                  <span
                    style={{
                      color: C.muted,
                      fontSize: 14,
                      marginLeft: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.07}>
          <div className="big-card" style={card}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'rgba(255,140,32,0.65)',
                marginBottom: 10,
              }}
            >
              {lang === 'en' ? 'Contact' : 'Contacto'}
            </p>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(26px,2.8vw,40px)',
                lineHeight: 1.2,
                ...gradText,
                margin: '0 0 28px',
              }}
            >
              {lang === 'en'
                ? 'Come eat with us.'
                : 'Ven a comer con nosotros.'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ ...row, alignItems: 'flex-start' }}>
                <MapPin
                  size={19}
                  color={C.orange}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: 14,
                      marginBottom: 5,
                    }}
                  >
                    {lang === 'en' ? 'Address' : 'Direccion'}
                  </div>
                  <div
                    style={{ color: C.muted, fontSize: 14, lineHeight: 1.65 }}
                  >
                    {R.address}
                  </div>
                </div>
              </div>
              <div style={{ ...row, alignItems: 'flex-start' }}>
                <Phone
                  size={19}
                  color={C.orange}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: 14,
                      marginBottom: 5,
                    }}
                  >
                    {lang === 'en' ? 'Phone' : 'Telefono'}
                  </div>
                  <a
                    href={`tel:${R.phone1Raw}`}
                    style={{
                      display: 'block',
                      color: C.muted,
                      fontSize: 14,
                      textDecoration: 'none',
                    }}
                  >
                    {R.phone1}
                  </a>
                  <a
                    href={`tel:${R.phone2Raw}`}
                    style={{
                      display: 'block',
                      color: C.muted,
                      fontSize: 14,
                      textDecoration: 'none',
                    }}
                  >
                    {R.phone2}
                  </a>
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 26,
                flexWrap: 'wrap',
              }}
            >
              <Btn href={`tel:${R.phone1Raw}`}>
                <Phone size={17} />
                {lang === 'en' ? 'Call Us' : 'Llamar'}
              </Btn>
              <Btn variant="outline" href={R.maps} target="_blank">
                <MapPin size={17} />
                {lang === 'en' ? 'Open Maps' : 'Ver Mapa'}
              </Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────
function Footer({ lang }) {
  return (
    <>
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '28px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <img
            src={LOGO}
            alt="Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `1.5px solid ${C.border}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: C.orange,
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              Pupuseria El Amanecer
            </div>
            <div style={{ color: '#5a3820', fontSize: 12, marginTop: 2 }}>
              {lang === 'en'
                ? 'Authentic Salvadoran & Latin American Cuisine'
                : 'Cocina Salvadorena y Latinoamericana Autentica'}
            </div>
          </div>
        </div>
        <div style={{ color: '#5a3820', fontSize: 13 }}>
          &copy; {new Date().getFullYear()} Pupuseria El Amanecer.{' '}
          {lang === 'en'
            ? 'All rights reserved.'
            : 'Todos los derechos reservados.'}
        </div>
      </footer>

      {/* Socials bar */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: 'rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>
          {lang === 'en' ? 'Follow us:' : 'Siguenos:'}
        </span>
        <a
          href="https://www.facebook.com/people/Pupuseria-restaurante-el-Amanecer/61579854238046/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(255,140,32,0.1)',
            border: `1px solid ${C.border}`,
            borderRadius: 999,
            padding: '7px 16px',
            color: C.orange,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'background .2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,140,32,0.22)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255,140,32,0.1)')
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={C.orange}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
          Facebook
        </a>
      </div>
    </>
  );
}

// ── ROOT ──────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('en');
  const [showPicker, setShowPicker] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLang, setViewerLang] = useState('en');
  const [viewerPage, setViewerPage] = useState(0);

  const openPicker = useCallback(() => {
    const el = document.getElementById('menu');
    if (el) {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top >= 0 && rect.top < window.innerHeight / 2;
      if (alreadyVisible) {
        setShowPicker(true);
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => setShowPicker(true), 300);
      }
    } else {
      setShowPicker(true);
    }
  }, []);

  const pickLang = useCallback((l) => {
    setViewerLang(l);
    setViewerPage(0);
    setShowPicker(false);
    setViewerOpen(true);
  }, []);
  const openDirect = useCallback((l, pg = 0) => {
    setViewerLang(l);
    setViewerPage(pg);
    setShowPicker(false);
    setViewerOpen(true);
  }, []);
  const closeViewer = useCallback(() => setViewerOpen(false), []);
  const closePicker = useCallback(() => setShowPicker(false), []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav lang={lang} setLang={setLang} onMenuOpen={openPicker} />
      <Hero lang={lang} onMenuOpen={openPicker} />
      <About lang={lang} />
      <MenuViewer
        lang={lang}
        viewerOpen={viewerOpen}
        onViewerOpen={(l, pg) => (l ? openDirect(l, pg) : openPicker())}
        onViewerClose={closeViewer}
        initLang={viewerLang}
        initPage={viewerPage}
      />
      <Gallery lang={lang} />
      <Reviews lang={lang} />
      <Visit lang={lang} />
      <Footer lang={lang} />

      <AnimatePresence>
        {showPicker && (
          <LangPickModal onPick={pickLang} onClose={closePicker} />
        )}
      </AnimatePresence>
    </div>
  );
}
