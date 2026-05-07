import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Shield, SlidersHorizontal, Compass } from 'lucide-react'
import Card from '../../components/UI/Card'
import { useTheme } from '../../contexts/use-theme.js'
import './SettingsPage.css'

const STORAGE_KEY = 'smartrip_settings'

const defaultSettings = {
  darkMode: false,
  communitySuggestions: true,
  profileVisibility: 'community',
}

const SettingsPage = () => {
  const { theme, setTheme } = useTheme()

  const initial = useMemo(() => {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      return {
        ...defaultSettings,
        ...parsed,
        darkMode: theme === 'dark',
      }
    } catch {
      return {
        ...defaultSettings,
        darkMode: theme === 'dark',
      }
    }
  }, [theme])

  const [settings, setSettings] = useState(initial)
  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode: theme === 'dark' }))
  }, [theme])

  useEffect(() => {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    if (field === 'darkMode') {
      setTheme(value ? 'dark' : 'light')
    }
  }

  return (
    <div className="settings-page page-container">
      <div className="page-header">
        <h1>Configuracion</h1>
        <p>Controla tu experiencia en SmarTrip y privacidad. Los cambios se aplican al instante.</p>
      </div>

      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-title"><Compass size={16} /> Preferencias de Viaje</div>
          <Link 
            to="/travel-preferences" 
            className="settings-item settings-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              borderRadius: 'var(--border-radius)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <span>Configurar perfil de viaje</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
          </Link>
          <p className="settings-help">
            Responde un cuestionario adaptativo para personalizar tus recomendaciones de viaje.
          </p>
        </Card>

        <Card className="settings-card">
          <div className="settings-title"><SlidersHorizontal size={16} /> Experiencia</div>
          <label className="settings-item">
            <span><Moon size={14} /> Modo oscuro</span>
            <input type="checkbox" checked={settings.darkMode} onChange={(e) => setField('darkMode', e.target.checked)} />
          </label>
          <label className="settings-item">
            <span>Sugerencias de comunidad</span>
            <input type="checkbox" checked={settings.communitySuggestions} onChange={(e) => setField('communitySuggestions', e.target.checked)} />
          </label>
          <p className="settings-help">
            Idioma y notificaciones no se muestran aqui porque todavia no tienen soporte completo del backend.
          </p>
        </Card>

        <Card className="settings-card">
          <div className="settings-title"><Shield size={16} /> Privacidad</div>
          <div className="settings-item-column">
            <span>Visibilidad del perfil</span>
            <select value={settings.profileVisibility} onChange={(e) => setField('profileVisibility', e.target.value)}>
              <option value="public">Publico</option>
              <option value="community">Solo comunidad</option>
              <option value="private">Privado</option>
            </select>
          </div>
          <p className="settings-help">
            Estos ajustes se guardan localmente en este dispositivo para una configuracion rapida.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
