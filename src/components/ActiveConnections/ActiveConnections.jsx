import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getUserConnections, removeConnection } from '../../services/socialService'
import './ActiveConnections.css'

const getConnectionRecordId = (c) => c?.id ?? c?.connectionId

const getPeerDisplayName = (c) => {
  const fullName = [c?.firstName, c?.lastName].filter(Boolean).join(' ').trim()
  return (
    c?.connectedUserName ||
    c?.travelerName ||
    c?.peerName ||
    c?.otherUserName ||
    c?.displayName ||
    fullName ||
    c?.username ||
    'Viajero'
  )
}

const getPeerImage = (c) =>
  c?.connectedUserProfileImage ?? c?.profileImage ?? c?.avatarUrl ?? null

const ActiveConnections = ({ userId }) => {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const load = useCallback(async () => {
    if (userId == null) {
      setLoading(false)
      setConnections([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await getUserConnections(userId)
      setConnections(list)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus conexiones')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const handleConfirmRemove = async (connection) => {
    const cid = getConnectionRecordId(connection)
    if (cid == null) return

    setRemovingId(cid)
    setError(null)
    setSuccessMessage(null)
    try {
      await removeConnection(cid)
      setConnections((prev) => prev.filter((c) => getConnectionRecordId(c) !== cid))
      setConfirmingId(null)
      setSuccessMessage(
        'Conexión eliminada. Si compartían un espacio de coordinación, el otro usuario ya no tendrá acceso.'
      )
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la conexión')
    } finally {
      setRemovingId(null)
    }
  }

  if (userId == null) {
    return (
      <div className="active-connections active-connections--notice">
        <p>Inicia sesión para ver y gestionar tus conexiones.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="active-connections active-connections--loading">
        <div className="active-connections__spinner" aria-hidden />
        <p>Cargando conexiones…</p>
      </div>
    )
  }

  return (
    <section className="active-connections" aria-labelledby="active-connections-title">
      <div className="active-connections__header">
        <h2 id="active-connections-title">Mis conexiones</h2>
        <p>Personas con las que ya estás conectado para compartir o coordinar.</p>
      </div>

      {error && (
        <div className="active-connections__banner active-connections__banner--error" role="alert">
          <p>{error}</p>
          <button type="button" className="active-connections__dismiss" onClick={() => setError(null)} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="active-connections__banner active-connections__banner--success">
          <p>{successMessage}</p>
          <button
            type="button"
            className="active-connections__dismiss"
            onClick={() => setSuccessMessage(null)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      <ul className="active-connections__list">
        {connections.map((c) => {
          const cid = getConnectionRecordId(c)
          const name = getPeerDisplayName(c)
          const img = getPeerImage(c)
          const isConfirming = confirmingId === cid
          const isRemoving = removingId === cid

          return (
            <li key={cid ?? name} className="active-connections__card">
              <div className="active-connections__card-main">
                <div className="active-connections__avatar">
                  {img ? <img src={img} alt="" /> : <span aria-hidden>{name.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="active-connections__meta">
                  <span className="active-connections__name">{name}</span>
                </div>
              </div>

              {!isConfirming ? (
                <div className="active-connections__actions">
                  <Link
                    className="active-connections__btn-chat"
                    to={`/social/chat/${cid}?name=${encodeURIComponent(name)}`}
                  >
                    Abrir chat
                  </Link>
                  <button
                    type="button"
                    className="active-connections__btn-remove"
                    onClick={() => setConfirmingId(cid)}
                    disabled={isRemoving}
                  >
                    Eliminar conexión
                  </button>
                </div>
              ) : (
                <div className="active-connections__confirm" role="group" aria-label="Confirmar eliminación">
                  <p className="active-connections__confirm-text">
                    ¿Eliminar esta conexión? Dejarás de coordinar con esta persona.
                  </p>
                  <div className="active-connections__confirm-actions">
                    <button
                      type="button"
                      className="active-connections__btn-cancel"
                      onClick={() => setConfirmingId(null)}
                      disabled={isRemoving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="active-connections__btn-danger"
                      onClick={() => handleConfirmRemove(c)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {connections.length === 0 && (
        <div className="active-connections__empty">
          <p>No tienes conexiones activas todavía.</p>
          <p className="active-connections__empty-hint">Cuando aceptes solicitudes de otros viajeros, aparecerán aquí.</p>
        </div>
      )}
    </section>
  )
}

export default ActiveConnections
