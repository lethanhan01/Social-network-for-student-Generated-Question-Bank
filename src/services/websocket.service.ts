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

class WebSocketService {
  private client: Client | null = null
  private isConnected = false
  private readonly messageListeners = new Set<(msg: WsMessageBroadcastDto) => void>()
  private readonly typingListeners = new Map<number, Set<(typing: WsTypingBroadcastDto) => void>>()

  public get connected(): boolean { return this.isConnected && !!this.client?.connected }

  public connect(): void {
    const token = useAuthStore.getState().token
    if (!token || this.client?.active) return

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
        this.subscribePrivateMessages()
      },
      onWebSocketClose: () => { this.isConnected = false },
      onDisconnect: () => {
        this.isConnected = false
      },
      onStompError: (frame) => {
        logger.error('[STOMP Error]', { data: frame.headers['message'] })
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

  public subscribeTyping(
    conversationId: number,
    callback: (typing: WsTypingBroadcastDto) => void
  ): () => void {
    if (!this.typingListeners.has(conversationId)) {
      this.typingListeners.set(conversationId, new Set())
    }
    this.typingListeners.get(conversationId)!.add(callback)

    let sub: StompSubscription | null = null
    if (this.client && this.isConnected) {
      sub = this.client.subscribe(`/topic/conv.${conversationId}.typing`, (msg: IMessage) => {
        try {
          const payload: WsTypingBroadcastDto = JSON.parse(msg.body)
          callback(payload)
        } catch {
          // ignore parse error
        }
      })
    }

    return () => {
      this.typingListeners.get(conversationId)?.delete(callback)
      sub?.unsubscribe()
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
    }
  }
}

export const webSocketService = new WebSocketService()
export const websocketService = webSocketService
