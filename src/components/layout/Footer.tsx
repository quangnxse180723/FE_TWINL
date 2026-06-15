import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PATHS } from '../../routes/paths'
import '../../styles/components/footer.css'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer dark-section">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__logo">Twinl</span>
          <p>{t('footer.brand_desc')}</p>
        </div>
        <div className="footer__column">
          <h4>{t('footer.products')}</h4>
          <Link to={PATHS.women}>{t('header.women')}</Link>
          <Link to={PATHS.men}>{t('header.men')}</Link>
          <Link to={PATHS.kids}>{t('header.kids')}</Link>
          <Link to={PATHS.sport}>{t('header.sport')}</Link>
        </div>
        <div className="footer__column">
          <h4>{t('footer.about')}</h4>
          <a href="#">{t('footer.link_about')}</a>
          <Link to={PATHS.contact}>{t('header.contact')}</Link>
          <a href="#">{t('footer.link_care')}</a>
          <a href="#">{t('footer.link_culture')}</a>
          <a href="#">{t('footer.link_blog')}</a>
        </div>
        <div className="footer__column">
          <h4>{t('footer.support')}</h4>
          <a href="#">{t('footer.link_getting_started')}</a>
          <a href="#">{t('footer.link_help_center')}</a>
          <a href="#">{t('footer.link_server_status')}</a>
          <a href="#">{t('footer.link_report_bug')}</a>
          <a href="#">{t('footer.link_chat_support')}</a>
        </div>
        <div className="footer__column">
          <h4>{t('footer.download')}</h4>
          <a href="#">iOS</a>
          <a href="#">Android</a>
          <a href="#">Mac</a>
          <a href="#">Windows</a>
          <a href="#">Chrome</a>
        </div>
      </div>
      <div className="footer__bottom">
        <span>{t('footer.copyright')}</span>
        <div className="footer__legal">
          <a href="#">{t('footer.terms')}</a>
          <a href="#">{t('footer.privacy')}</a>
        </div>
      </div>
    </footer>
  )
}
