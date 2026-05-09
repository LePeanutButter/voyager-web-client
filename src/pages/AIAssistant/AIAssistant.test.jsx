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

  it('limpia historial si el usuario confirma', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    render(<AIAssistant />)
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(chat.clearHistory).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('no limpia historial si el usuario cancela', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false)
    render(<AIAssistant />)
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(chat.clearHistory).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('pregunta rapida rellena el input', async () => {
    render(<AIAssistant />)
    await userEvent.click(screen.getByRole('button', { name: /Encuentra destinos romanticos/i }))
    expect(screen.getByLabelText('Chat message input')).toHaveValue(
      'Encuentra destinos romanticos en Europa',
    )
  })

  it('chips de sugerencias en mensaje IA', async () => {
    chat.messages = [
      {
        id: 'm2',
        type: 'ai',
        content: 'Opciones',
        timestamp: '2026-01-01T12:00:00Z',
        suggestions: [{ text: 'Chip uno' }, 'Chip dos'],
      },
    ]
    render(<AIAssistant />)
    await userEvent.click(screen.getByRole('button', { name: /Chip uno/i }))
    expect(screen.getByLabelText('Chat message input')).toHaveValue('Chip uno')
    await userEvent.click(screen.getByRole('button', { name: /Chip dos/i }))
    expect(screen.getByLabelText('Chat message input')).toHaveValue('Chip dos')
  })

  it('feedback negativo llama submitFeedback con rating bajo', async () => {
    chat.messages = [
      {
        id: 'm3',
        type: 'ai',
        content: 'X',
        timestamp: 'bad-ts',
        metadata: { rankedItems: [{ id: 'act-9' }] },
      },
    ]
    render(<AIAssistant />)
    await userEvent.click(screen.getByTitle('No util'))
    expect(chat.submitFeedback).toHaveBeenCalledWith('m3', 'act-9', 1)
  })

  it('indicador de escritura cuando loading', () => {
    chat.loading = true
    const { container } = render(<AIAssistant />)
    expect(container.querySelector('.typing-indicator')).toBeTruthy()
  })

  it('Enter envia sin Shift', async () => {
    render(<AIAssistant />)
    const input = screen.getByLabelText('Chat message input')
    await userEvent.type(input, 'Hola{Enter}')
    expect(chat.sendMessage).toHaveBeenCalledWith('Hola')
  })
})
