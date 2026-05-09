/**
 * MenuPreferences Page
 * Allows users to customize their menu preferences
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuOrganization } from '../hooks/useMenuOrganization';
import { MenuPriority } from '../services/menuOrganizationService';
import { useAuth } from '../contexts/AuthContext';
import './MenuPreferences.css';

const MenuPreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    menuData, 
    loading, 
    error, 
    updatePreferences, 
    resetLayout,
    analytics,
    loadAnalytics 
  } = useMenuOrganization();

  const [preferredItems, setPreferredItems] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [priorityChanges, setPriorityChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('preferences');

  // Load analytics when component mounts
  useEffect(() => {
    if (user?.id) {
      loadAnalytics(30);
    }
  }, [user?.id, loadAnalytics]);

  // Initialize preferences from current menu data
  useEffect(() => {
    if (menuData?.layout) {
      const preferred = menuData.layout
        .filter(item => item.priority === MenuPriority.HIGH)
        .map(item => item.item_id);
      
      const hidden = menuData.layout
        .filter(item => !item.visible || item.category === 'hidden')
        .map(item => item.item_id);

      setPreferredItems(preferred);
      setHiddenItems(hidden);
    }
  }, [menuData]);

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    setSaveError(null);
    setSuccessMessage('');

    try {
      await updatePreferences({
        preferred_items: preferredItems,
        hidden_items: hiddenItems,
        priority_changes: priorityChanges
      });

      setSuccessMessage('Preferencias del menú guardadas exitosamente');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetLayout = async () => {
    if (!user?.id) return;

    if (globalThis.confirm('¿Estás seguro de que deseas restablecer el menú a su configuración predeterminada? Se perderán todas tus personalizaciones.')) {
      try {
        await resetLayout();
        setSuccessMessage('Menú restablecido exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setSaveError(err.message);
      }
    }
  };

  const togglePreferredItem = (itemId) => {
    setPreferredItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    
    // Remove from hidden if added to preferred
    setHiddenItems(prev => prev.filter(id => id !== itemId));
  };

  const toggleHiddenItem = (itemId) => {
    setHiddenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    
    // Remove from preferred if added to hidden
    setPreferredItems(prev => prev.filter(id => id !== itemId));
  };

  const updateItemPriority = (itemId, priority) => {
    setPriorityChanges(prev => ({
      ...prev,
      [itemId]: priority
    }));
  };

  if (loading) {
    return (
      <div className="menu-preferences-page loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <span>Cargando preferencias del menú...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-preferences-page error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-preferences-page">
      <div className="preferences-header">
        <h1>Preferencias del Menú</h1>
        <p>Personaliza tu experiencia de navegación según tus hábitos de uso</p>
      </div>

      {/* Tabs */}
      <div className="preferences-tabs">
        <button
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferencias
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Análisis de Uso
        </button>
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="preferences-content">
          <div className="menu-items-section">
            <h2>Personalizar Elementos del Menú</h2>
            <p>Selecciona tus elementos favoritos y oculta los que no usas frecuentemente</p>

            {menuData?.layout?.map((item) => (
              <div key={item.item_id} className="menu-item-preference">
                <div className="item-info">
                  <span className="item-icon">{getIconForItem(item.icon)}</span>
                  <span className="item-label">{item.label}</span>
                  <span className="item-category">{getCategoryLabel(item.category)}</span>
                </div>
                
                <div className="item-controls">
                  <label className="control-checkbox">
                    <input
                      type="checkbox"
                      checked={preferredItems.includes(item.item_id)}
                      onChange={() => togglePreferredItem(item.item_id)}
                    />
                    <span>Favorito</span>
                  </label>
                  
                  <label className="control-checkbox">
                    <input
                      type="checkbox"
                      checked={hiddenItems.includes(item.item_id)}
                      onChange={() => toggleHiddenItem(item.item_id)}
                    />
                    <span>Ocultar</span>
                  </label>
                  
                  <select
                    value={priorityChanges[item.item_id] || item.priority}
                    onChange={(e) => updateItemPriority(item.item_id, e.target.value)}
                    className="priority-select"
                  >
                    <option value={MenuPriority.HIGH}>Alta</option>
                    <option value={MenuPriority.MEDIUM}>Media</option>
                    <option value={MenuPriority.LOW}>Baja</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="preferences-actions">
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Guardando...' : 'Guardar Preferencias'}
            </button>
            
            <button
              onClick={handleResetLayout}
              className="reset-button"
            >
              Restablecer Menú
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="success-message">
              ✅ {successMessage}
            </div>
          )}
          
          {saveError && (
            <div className="error-message">
              ⚠️ {saveError}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <h2>Análisis de Uso del Menú</h2>
          
          {analytics ? (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Estadísticas Generales</h3>
                <div className="stat">
                  <span className="stat-label">Total de Interacciones:</span>
                  <span className="stat-value">{analytics.total_interactions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Último Análisis:</span>
                  <span className="stat-value">
                    {new Date(analytics.last_analyzed).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Elementos Más Usados</h3>
                {analytics.most_used_items.map((item, index) => (
                  <div key={item.item} className="usage-item">
                    <span className="usage-rank">#{index + 1}</span>
                    <span className="usage-name">{item.item}</span>
                    <span className="usage-count">{item.count} veces</span>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>Elementos Menos Usados</h3>
                {analytics.least_used_items.map((item, index) => (
                  <div key={item.item} className="usage-item">
                    <span className="usage-rank">#{index + 1}</span>
                    <span className="usage-name">{item.item}</span>
                    <span className="usage-count">{item.count} veces</span>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>Patrones de Uso</h3>
                {analytics.usage_patterns.map((pattern, index) => (
                  <div key={`usage-pattern-${index}-${pattern}`} className="pattern-item">
                    <span className="pattern-icon">📊</span>
                    <span className="pattern-text">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-analytics">
              <span>No hay datos de análisis disponibles. Usa el menú durante unos días para generar estadísticas.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions
const getIconForItem = (iconName) => {
  const iconMap = {
    'home': '🏠',
    'search': '🔍',
    'star': '⭐',
    'users': '👥',
    'map': '🗺️',
    'calendar': '📅',
    'user': '👤',
    'settings': '⚙️',
    'help-circle': '❓',
    'info': 'ℹ️'
  };
  return iconMap[iconName] || '📋';
};

const getCategoryLabel = (category) => {
  const categoryMap = {
    'primary': 'Principal',
    'secondary': 'Secundario',
    'hidden': 'Oculto'
  };
  return categoryMap[category] || category;
};

export default MenuPreferences;
