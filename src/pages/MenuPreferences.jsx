/**
 * MenuPreferences Page
 * Allows users to customize their menu preferences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuOrganization } from '../hooks/useMenuOrganization';
import { MenuPriority } from '../services/menuOrganizationService';
import { useAuth } from '../contexts/AuthContext';

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

    if (window.confirm('¿Estás seguro de que deseas restablecer el menú a su configuración predeterminada? Se perderán todas tus personalizaciones.')) {
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
                  <div key={index} className="pattern-item">
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

      <style jsx>{`
        .menu-preferences-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .preferences-header {
          margin-bottom: 32px;
        }

        .preferences-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #333333);
          margin-bottom: 8px;
        }

        .preferences-header p {
          font-size: 16px;
          color: var(--text-secondary, #666666);
        }

        .preferences-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
          margin-bottom: 24px;
        }

        .tab-button {
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary, #666666);
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: var(--text-primary, #333333);
        }

        .tab-button.active {
          color: var(--primary-color, #1976d2);
          border-bottom-color: var(--primary-color, #1976d2);
        }

        .preferences-content, .analytics-content {
          background: var(--surface-color, #ffffff);
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .menu-items-section h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #333333);
          margin-bottom: 8px;
        }

        .menu-items-section p {
          font-size: 14px;
          color: var(--text-secondary, #666666);
          margin-bottom: 24px;
        }

        .menu-item-preference {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-icon {
          font-size: 20px;
        }

        .item-label {
          font-weight: 500;
          color: var(--text-primary, #333333);
        }

        .item-category {
          font-size: 12px;
          padding: 4px 8px;
          background: var(--surface-variant, #f8f9fa);
          border-radius: 4px;
          color: var(--text-secondary, #666666);
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .priority-select {
          padding: 6px 12px;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 4px;
          font-size: 14px;
        }

        .preferences-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, #e0e0e0);
        }

        .save-button {
          padding: 12px 24px;
          background: var(--primary-color, #1976d2);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-button:hover:not(:disabled) {
          background: var(--primary-color-hover, #1565c0);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reset-button {
          padding: 12px 24px;
          background: var(--error-color, #d32f2f);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .reset-button:hover {
          background: var(--error-color-hover, #c62828);
        }

        .cancel-button {
          padding: 12px 24px;
          background: transparent;
          color: var(--text-secondary, #666666);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button:hover {
          background: var(--surface-variant, #f8f9fa);
        }

        .success-message, .error-message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-top: 16px;
          font-size: 14px;
        }

        .success-message {
          background: var(--success-color-light, #e8f5e8);
          color: var(--success-color, #2e7d32);
          border: 1px solid var(--success-color, #2e7d32);
        }

        .error-message {
          background: var(--error-color-light, #ffebee);
          color: var(--error-color, #d32f2f);
          border: 1px solid var(--error-color, #d32f2f);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .analytics-card {
          background: var(--surface-variant, #f8f9fa);
          border-radius: 8px;
          padding: 20px;
        }

        .analytics-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #333333);
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-label {
          color: var(--text-secondary, #666666);
        }

        .stat-value {
          font-weight: 500;
          color: var(--text-primary, #333333);
        }

        .usage-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
        }

        .usage-item:last-child {
          border-bottom: none;
        }

        .usage-rank {
          font-weight: 600;
          color: var(--primary-color, #1976d2);
          min-width: 24px;
        }

        .usage-name {
          flex: 1;
          color: var(--text-primary, #333333);
        }

        .usage-count {
          font-size: 12px;
          color: var(--text-secondary, #666666);
        }

        .pattern-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        }

        .pattern-icon {
          font-size: 16px;
        }

        .pattern-text {
          color: var(--text-primary, #333333);
        }

        .no-analytics {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary, #666666);
        }

        .loading, .error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-content, .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color, #e0e0e0);
          border-top: 3px solid var(--primary-color, #1976d2);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 32px;
        }

        .back-button {
          padding: 8px 16px;
          background: var(--primary-color, #1976d2);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .menu-preferences-page {
            padding: 16px;
          }
          
          .menu-item-preference {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .item-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .preferences-actions {
            flex-direction: column;
          }
          
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
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
