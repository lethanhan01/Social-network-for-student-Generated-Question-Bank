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

  public connect(): void {
    const token = useAuthStore.getState().token
    if (!token || this.client?.active) return

    this.setStatus('CONNECTING')
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://snsqb.duckdns.org/api/v1/ws'

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
        const payload: WsMessageBroadcastDto = JSON.parse(message.body)
        this.messageListeners.forEach((listener) => listener(payload))
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

  public sendMessage(payload: SendWsMessageRequestDto): void {
    if (!this.client || !this.isConnected) return
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    })
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
