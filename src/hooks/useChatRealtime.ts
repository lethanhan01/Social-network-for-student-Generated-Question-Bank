import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { webSocketService } from '@/services/websocket.service'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/authStore'

export function useChatRealtime() {
  const client = useQueryClient()
  const token = useAuthStore((state) => state.token)
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    webSocketService.connect()
    const unsubscribe = webSocketService.onMessage((message) => {
      void client.invalidateQueries({ queryKey: queryKeys.conversations.inbox() })
      void client.invalidateQueries({ queryKey: queryKeys.conversations.hidden() })
      void client.invalidateQueries({ queryKey: queryKeys.conversations.messageThread(message.conversation_id) })
    })
    const timer = window.setInterval(() => setConnected(webSocketService.connected), 1000)
    return () => {
      clearInterval(timer)
      unsubscribe()
      webSocketService.disconnect()
    }
  }, [client, token])
  return connected
}
