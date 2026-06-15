import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldCheck, RefreshCcw, Star, Users, TrendingUp, Sparkles } from 'lucide-react'
import type { RootState } from '../../store'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/home.css'

export default function HomePage() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast.info(t('home.sell_prompt'))
      navigate(PATHS.login)
    } else {
      navigate(PATHS.sellerDashboard)
    }
  }

  return (
    <div className="hp">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="home-hero" className="hp-hero dark-section">
        <div className="hp-hero__bg" aria-hidden="true" />
        <div className="hp-hero__content">
          <span className="hp-hero__eyebrow">
            <Sparkles size={14} /> {t('home.hero_eyebrow')}
          </span>
          <h1 className="hp-hero__title">
            <span style={{ whiteSpace: 'nowrap' }}>{t('home.hero_title_1')}</span><br />
            <em>{t('home.hero_title_2')}</em>
          </h1>
          <p className="hp-hero__sub">
            {t('home.hero_sub')}
          </p>
          <div className="hp-hero__actions">
            <Link to={PATHS.women} className="hp-btn hp-btn--primary">
              {t('home.hero_explore')} <ArrowRight size={16} />
            </Link>
            <button type="button" onClick={handleSellClick} className="hp-btn hp-btn--ghost">
              {t('home.hero_sell')}
            </button>
          </div>
          <div className="hp-hero__stats">
            <div className="hp-hero__stat">
              <strong>10K+</strong><span>{t('home.hero_stat_1')}</span>
            </div>
            <div className="hp-hero__stat-divider" />
            <div className="hp-hero__stat">
              <strong>98%</strong><span>{t('home.hero_stat_2')}</span>
            </div>
            <div className="hp-hero__stat-divider" />
            <div className="hp-hero__stat">
              <strong>5★</strong><span>{t('home.hero_stat_3')}</span>
            </div>
          </div>
        </div>
        <div className="hp-hero__visual">
          <div className="hp-hero__img-stack">
            <div className="hp-hero__img-card hp-hero__img-card--back">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
                alt="Fashion"
              />
            </div>
            <div className="hp-hero__img-card hp-hero__img-card--front">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
                alt="Fashion"
              />
              <div className="hp-hero__img-tag">
                <ShieldCheck size={14} />
                <span>{t('home.hero_auth')}</span>
              </div>
            </div>
          </div>
          <div className="hp-hero__floating-card">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <div>
              <p>{t('home.hero_success_title')}</p>
              <span>{t('home.hero_success_desc')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────────── */}
      <section className="hp-trust">
        <div className="hp-trust__inner">
          <div className="hp-trust__item">
            <ShieldCheck size={24} className="hp-trust__icon" />
            <div>
              <h4>{t('home.trust_1_title')}</h4>
              <p>{t('home.trust_1_desc')}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <RefreshCcw size={24} className="hp-trust__icon" />
            <div>
              <h4>{t('home.trust_2_title')}</h4>
              <p>{t('home.trust_2_desc')}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <Star size={24} className="hp-trust__icon" />
            <div>
              <h4>{t('home.trust_3_title')}</h4>
              <p>{t('home.trust_3_desc')}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <Users size={24} className="hp-trust__icon" />
            <div>
              <h4>{t('home.trust_4_title')}</h4>
              <p>{t('home.trust_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BANNER ──────────────────────────────────── */}
      <section className="hp-categories">
        <div className="hp-categories__inner">
          <Link to={PATHS.women} className="hp-cat-card hp-cat-card--women">
            <div className="hp-cat-card__bg" />
            <div className="hp-cat-card__body">
              <span className="hp-cat-card__tag">{t('home.cat_tag_new')}</span>
              <h2>{t('home.cat_women')}</h2>
              <p>{t('home.cat_women_desc')}</p>
              <span className="hp-cat-card__cta">{t('home.cat_view')} <ArrowRight size={14} /></span>
            </div>
          </Link>
          <div className="hp-cat-card-col">
            <Link to={PATHS.men} className="hp-cat-card hp-cat-card--men">
              <div className="hp-cat-card__bg" />
              <div className="hp-cat-card__body">
                <span className="hp-cat-card__tag">{t('home.cat_tag_trend')}</span>
                <h2>{t('home.cat_men')}</h2>
                <span className="hp-cat-card__cta">{t('home.cat_view')} <ArrowRight size={14} /></span>
              </div>
            </Link>
            <Link to={PATHS.kids} className="hp-cat-card hp-cat-card--kids">
              <div className="hp-cat-card__bg" />
              <div className="hp-cat-card__body">
                <span className="hp-cat-card__tag">{t('home.cat_tag_cute')}</span>
                <h2>{t('home.cat_kids')}</h2>
                <span className="hp-cat-card__cta">{t('home.cat_view')} <ArrowRight size={14} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="hp-how">
        <div className="hp-how__inner">
          <div className="hp-how__left">
            <p className="hp-section__eyebrow">{t('home.how_eyebrow')}</p>
            <h2>{t('home.how_title')}</h2>
            <p className="hp-how__desc">
              {t('home.how_desc')}
            </p>
            <Link to={PATHS.women} className="hp-btn hp-btn--primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
              {t('home.how_start')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hp-how__steps">
            {[
              { num: '01', title: t('home.how_step_1_title'), desc: t('home.how_step_1_desc') },
              { num: '02', title: t('home.how_step_2_title'), desc: t('home.how_step_2_desc') },
              { num: '03', title: t('home.how_step_3_title'), desc: t('home.how_step_3_desc') },
              { num: '04', title: t('home.how_step_4_title'), desc: t('home.how_step_4_desc') },
            ].map((step) => (
              <div key={step.num} className="hp-how__step">
                <span className="hp-how__step-num">{step.num}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ───────────────────────────────────────── */}
      <section className="hp-sell-cta dark-section">
        <div className="hp-sell-cta__inner">
          <div className="hp-sell-cta__text">
            <TrendingUp size={32} className="hp-sell-cta__icon" />
            <h2>{t('home.cta_title')}</h2>
            <p>
              {t('home.cta_desc')}
            </p>
            <div className="hp-sell-cta__actions">
              <button type="button" onClick={handleSellClick} className="hp-btn hp-btn--white">
                {t('home.cta_btn_1')} <ArrowRight size={16} />
              </button>
              <Link to={PATHS.contact} className="hp-btn hp-btn--outline-white">
                {t('home.cta_btn_2')}
              </Link>
            </div>
          </div>
          <div className="hp-sell-cta__deco" aria-hidden="true">
            <div className="hp-sell-cta__circle hp-sell-cta__circle--1" />
            <div className="hp-sell-cta__circle hp-sell-cta__circle--2" />
            <div className="hp-sell-cta__stat-card">
              <strong>+2,400</strong>
              <span>{t('home.cta_stat_title')}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
