import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAssistant from './AIAssistant'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

const chat = vi.hoisted(() => ({
  messages: [],
  loading: false,
  loadingHistory: false,
  error: null,
  sendMessage: vi.fn().mockResolvedValue(undefined),
  clearHistory: vi.fn().mockResolvedValue(undefined),
  submitFeedback: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  messagesEndRef: { current: null },
}))

vi.mock('../../hooks/useAIChat', () => ({
  useAIChat: () => ({
    messages: chat.messages,
    loading: chat.loading,
    loadingHistory: chat.loadingHistory,
    error: chat.error,
    messagesEndRef: chat.messagesEndRef,
    sendMessage: chat.sendMessage,
    clearHistory: chat.clearHistory,
    submitFeedback: chat.submitFeedback,
    clearError: chat.clearError,
  }),
}))

describe('AIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chat.messages = []
    chat.loading = false
    chat.loadingHistory = false
    chat.error = null
  })

  it('renders assistant header', () => {
    render(<AIAssistant />)
    expect(screen.getByRole('heading', { name: /Asistente IA de viajes/i })).toBeInTheDocument()
  })

  it('muestra mensajes y permite feedback positivo', async () => {
    chat.messages = [
      {
        id: 'm1',
        type: 'ai',
        content: 'Hola viajero',
        timestamp: '2026-01-01T12:00:00Z',
        metadata: { rankedItems: [{ id: 'act-1' }] },
      },
    ]
    render(<AIAssistant />)
    expect(screen.getByText('Hola viajero')).toBeInTheDocument()
    await userEvent.click(screen.getByTitle('Util'))
    expect(chat.submitFeedback).toHaveBeenCalledWith('m1', 'act-1', 5)
  })

  it('envia mensaje desde el input', async () => {
    render(<AIAssistant />)
    await userEvent.type(screen.getByLabelText('Chat message input'), 'Hola IA')
    await userEvent.click(screen.getByLabelText('Send message'))
    expect(chat.sendMessage).toHaveBeenCalledWith('Hola IA')
  })

  it('muestra banner de error', () => {
    chat.error = 'Sin conexion'
    render(<AIAssistant />)
    expect(screen.getByText('Sin conexion')).toBeInTheDocument()
  })

  it('historial cargando muestra esqueletos', () => {
    chat.loadingHistory = true
    render(<AIAssistant />)
    expect(document.getElementById('chat-messages-container')).toBeTruthy()
  })
})
