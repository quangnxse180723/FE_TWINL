import '../../styles/components/languageSwitcher.css'

import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('vi')

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/vi\/([a-z]{2})/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi'
    document.cookie = `googtrans=/vi/${newLang}; path=/`
    window.location.reload()
  }

  return (
    <button type="button" className="language-switcher" onClick={toggleLanguage} aria-label="Toggle language">
      {currentLang.startsWith('vi') ? '🇻🇳 VI' : '🇬🇧 EN'}
    </button>
  )
}
