import { useTranslation } from 'react-i18next'
import '../../styles/components/languageSwitcher.css'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('vi') ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  return (
    <button type="button" className="language-switcher" onClick={toggleLanguage} aria-label="Toggle language">
      {i18n.language.startsWith('vi') ? '🇻🇳 VI' : '🇬🇧 EN'}
    </button>
  )
}
