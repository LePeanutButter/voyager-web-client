import { useMemo, useState } from 'react'
import { Bell, Moon, Shield, SlidersHorizontal } from 'lucide-react'
import Card from '../../components/UI/Card'
import './SettingsPage.css'

const STORAGE_KEY = 'smartrip_settings'

const defaultSettings = {
  darkMode: false,
  emailNotifications: true,
  communitySuggestions: true,
  profileVisibility: 'community',
}

const SettingsPage = () => {
  const initial = useMemo(() => {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
    } catch {
      return defaultSettings
    }
  }, [])

  const [settings, setSettings] = useState(initial)
  const [saved, setSaved] = useState(false)

  const setField = (field, value) => {
    setSaved(false)
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
  }

  return (
    <div className="settings-page page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Controla tu experiencia SmarTrip, notificaciones y privacidad.</p>
      </div>

      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-title"><SlidersHorizontal size={16} /> Experience</div>
          <label className="settings-item">
            <span><Moon size={14} /> Dark mode (preview)</span>
            <input type="checkbox" checked={settings.darkMode} onChange={(e) => setField('darkMode', e.target.checked)} />
          </label>
          <label className="settings-item">
            <span><Bell size={14} /> Email notifications</span>
            <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setField('emailNotifications', e.target.checked)} />
          </label>
          <label className="settings-item">
            <span>Community suggestions</span>
            <input type="checkbox" checked={settings.communitySuggestions} onChange={(e) => setField('communitySuggestions', e.target.checked)} />
          </label>
        </Card>

        <Card className="settings-card">
          <div className="settings-title"><Shield size={16} /> Privacy</div>
          <div className="settings-item-column">
            <span>Profile visibility</span>
            <select value={settings.profileVisibility} onChange={(e) => setField('profileVisibility', e.target.value)}>
              <option value="public">Public</option>
              <option value="community">Only community</option>
              <option value="private">Private</option>
            </select>
          </div>
          <p className="settings-help">
            Estos ajustes se guardan localmente en este dispositivo para una configuracion rapida.
          </p>
        </Card>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" onClick={handleSave}>Guardar cambios</button>
        {saved && <span className="settings-saved">Configuracion guardada.</span>}
      </div>
    </div>
  )
}

export default SettingsPage
