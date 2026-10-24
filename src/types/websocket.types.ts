/**
 * STOMP Realtime WebSocket DTOs for SQB HUST Chat & Presence
 */

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE'

export interface SendWsMessageRequestDto {
  conversation_id: number
  content: string
  message_type?: MessageType
  media_urls?: string[]
  reply_to_message_id?: number | null
}

export interface ReadWsMessageRequestDto {
  conversation_id: number
  message_id: number
}

export interface TypingWsRequestDto {
  conversation_id: number
  is_typing: boolean
}

export interface WsMessageBroadcastDto {
  message_id: number
  conversation_id: number
  sender_id: number
  sender_name?: string
  sender_avatar?: string | null
  content: string
  message_type: MessageType
  media_urls?: string[]
  reply_to_message_id?: number | null
  created_at: string
}

export interface WsReadReceiptBroadcastDto {
  conversation_id: number
  message_id: number
  reader_id: number
  read_at: string
}

export interface WsTypingBroadcastDto {
  conversation_id: number
  user_id: number
  username: string
  is_typing: boolean
}
