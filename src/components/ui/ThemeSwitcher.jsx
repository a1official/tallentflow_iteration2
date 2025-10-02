import React, { useEffect, useState } from 'react'

const THEMES = ['default', 'aurora', 'sunset', 'midnight']

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('default')

  useEffect(() => {
    const saved = localStorage.getItem('tf_theme') || 'default'
    setTheme(saved)
  }, [])

  useEffect(() => {
    const body = document.body
    body.classList.remove('theme-aurora', 'theme-sunset', 'theme-midnight')
    if (theme !== 'default') body.classList.add(`theme-${theme}`)
    localStorage.setItem('tf_theme', theme)
  }, [theme])

  const cycle = () => {
    const idx = THEMES.indexOf(theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next)
  }

  const label = theme === 'default' ? 'Theme: Default' : `Theme: ${theme.charAt(0).toUpperCase()}${theme.slice(1)}`

  return (
    <button
      onClick={cycle}
      title={label}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '160px',
        zIndex: 1001,
        padding: '10px 12px',
        borderRadius: '5px',
        border: 'none',
        background: '#6c757d',
        color: 'white',
        cursor: 'pointer'
      }}
    >
      🎨 Theme
    </button>
  )
}
