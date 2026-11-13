import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/lib/logger'
import type {
  SendWsMessageRequestDto,
  ReadWsMessageRequestDto,
  TypingWsRequestDto,
  WsMessageBroadcastDto,
  WsTypingBroadcastDto,
} from '@/types/websocket.types'

export type WsConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

function normalizeWsMessage(raw: unknown): WsMessageBroadcastDto | null {
  const root = asRecord(raw)
  if (!root) return null
  const obj = asRecord(root.data) ?? root
  const sender = asRecord(obj.sender)

  const messageId = toFiniteNumber(obj.message_id ?? obj.messageId ?? obj.id)
  const conversationId = toFiniteNumber(obj.conversation_id ?? obj.conversationId)
  if (messageId === undefined || conversationId === undefined) return null

  const senderId = toFiniteNumber(
    obj.sender_id ?? obj.senderId ?? sender?.user_id ?? sender?.userId ?? sender?.id
  )
  const senderNameRaw =
    obj.sender_name ?? obj.senderName ?? sender?.full_name ?? sender?.fullName ?? sender?.username ?? sender?.name
  const senderAvatarRaw =
    obj.sender_avatar ?? obj.senderAvatar ?? sender?.avatar_url ?? sender?.avatarUrl
  const mediaRaw = obj.media_urls ?? obj.mediaUrls
  const createdAtRaw = obj.created_at ?? obj.createdAt

  return {
    message_id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    sender_name: typeof senderNameRaw === 'string' ? senderNameRaw : undefined,
    sender_avatar: typeof senderAvatarRaw === 'string' ? senderAvatarRaw : null,
    content: typeof obj.content === 'string' ? obj.content : String(obj.content ?? ''),
    message_type: (obj.message_type ?? obj.messageType ?? 'TEXT') as WsMessageBroadcastDto['message_type'],
    media_urls: Array.isArray(mediaRaw) ? mediaRaw.filter((u): u is string => typeof u === 'string') : undefined,
    reply_to_message_id: toFiniteNumber(obj.reply_to_message_id ?? obj.replyToMessageId) ?? null,
    created_at: typeof createdAtRaw === 'string' ? createdAtRaw : new Date().toISOString(),
  }
}

class WebSocketService {
  private client: Client | null = null
  private isConnected = false
  private status: WsConnectionStatus = 'DISCONNECTED'
  private readonly statusListeners = new Set<(status: WsConnectionStatus) => void>()
  private readonly messageListeners = new Set<(msg: WsMessageBroadcastDto) => void>()
  private readonly typingListeners = new Map<number, Set<(typing: WsTypingBroadcastDto) => void>>()
  private readonly activeTypingSubs = new Map<number, StompSubscription>()

  public getStatus(): WsConnectionStatus {
    return this.status
  }

  public onConnection(callback: (connected: boolean) => void): () => void {
    return this.onStatusChange((status) => callback(status === 'CONNECTED'))
  }

  public onStatusChange(callback: (status: WsConnectionStatus) => void): () => void {
    this.statusListeners.add(callback)
    callback(this.status)
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  private setStatus(newStatus: WsConnectionStatus): void {
    this.status = newStatus
    this.statusListeners.forEach((fn) => fn(newStatus))
  }

  public get connected(): boolean { return this.isConnected && !!this.client?.connected }

  public connect(): void {
    const token = useAuthStore.getState().token
    if (!token || this.client?.active) return

    this.setStatus('CONNECTING')
    const apiUrl = new URL(import.meta.env.VITE_API_URL || '/api/v1', window.location.origin)
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, '')}/ws`
    const rawWsUrl = import.meta.env.VITE_WS_URL || apiUrl.toString()
    const normalizedWsUrl = rawWsUrl.endsWith('/websocket')
      ? rawWsUrl
      : `${rawWsUrl.replace(/\/+$/, '')}/websocket`
    const wsUrl = `${normalizedWsUrl}?token=${encodeURIComponent(token)}`

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true
        this.setStatus('CONNECTED')
        this.subscribePrivateMessages()
        this.resubscribeTypingListeners()
      },
      onDisconnect: () => {
        this.isConnected = false
        this.setStatus('DISCONNECTED')
      },
      onWebSocketClose: () => {
        this.isConnected = false
        this.activeTypingSubs.clear()
        this.setStatus('DISCONNECTED')
      },
      onStompError: (frame) => {
        logger.error('[STOMP Error]', { data: frame.headers['message'] })
        this.setStatus('DISCONNECTED')
      },
    })

    this.client.activate()
  }

  private subscribePrivateMessages(): void {
    if (!this.client || !this.isConnected) return
    this.client.subscribe('/user/queue/messages', (message: IMessage) => {
      try {
        const parsed: unknown = JSON.parse(message.body)
        const payload = normalizeWsMessage(parsed)
        if (payload) {
          this.messageListeners.forEach((listener) => listener(payload))
        }
      } catch {
        // ignore parse error
      }
    })
  }

  private resubscribeTypingListeners(): void {
    if (!this.client || !this.isConnected) return
    this.typingListeners.forEach((listeners, convId) => {
      if (listeners.size > 0 && !this.activeTypingSubs.has(convId)) {
        const sub = this.client!.subscribe(`/topic/conv.${convId}.typing`, (msg: IMessage) => {
          try {
            const payload: WsTypingBroadcastDto = JSON.parse(msg.body)
            listeners.forEach((fn) => fn(payload))
          } catch {
            // ignore parse error
          }
        })
        this.activeTypingSubs.set(convId, sub)
      }
    })
  }

  public subscribeTyping(
    conversationId: number,
    callback: (typing: WsTypingBroadcastDto) => void
  ): () => void {
    if (!this.typingListeners.has(conversationId)) {
      this.typingListeners.set(conversationId, new Set())
    }
    this.typingListeners.get(conversationId)!.add(callback)

    if (this.client && this.isConnected && !this.activeTypingSubs.has(conversationId)) {
      const sub = this.client.subscribe(`/topic/conv.${conversationId}.typing`, (msg: IMessage) => {
        try {
          const payload: WsTypingBroadcastDto = JSON.parse(msg.body)
          this.typingListeners.get(conversationId)?.forEach((fn) => fn(payload))
        } catch {
          // ignore parse error
        }
      })
      this.activeTypingSubs.set(conversationId, sub)
    }

    return () => {
      const set = this.typingListeners.get(conversationId)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          this.typingListeners.delete(conversationId)
          this.activeTypingSubs.get(conversationId)?.unsubscribe()
          this.activeTypingSubs.delete(conversationId)
        }
      }
    }
  }

  public onMessage(callback: (msg: WsMessageBroadcastDto) => void): () => void {
    this.messageListeners.add(callback)
    return () => {
      this.messageListeners.delete(callback)
    }
  }

  public sendMessage(payload: SendWsMessageRequestDto): boolean {
    if (!this.client || !this.isConnected) return false
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    })
    return true
  }

  public markAsRead(payload: ReadWsMessageRequestDto): void {
    if (!this.client || !this.isConnected) return
    this.client.publish({
      destination: '/app/chat.read',
      body: JSON.stringify(payload),
    })
  }

  public sendTyping(payload: TypingWsRequestDto): void {
    if (!this.client || !this.isConnected) return
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    })
  }

  public disconnect(): void {
    if (this.client) {
      void this.client.deactivate()
      this.client = null
      this.isConnected = false
      this.setStatus('DISCONNECTED')
      this.activeTypingSubs.clear()
    }
  }
}

export const webSocketService = new WebSocketService()
export const websocketService = webSocketService
