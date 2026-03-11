export const WS_EVENTS = {
  WELCOME: 'welcome',
  REGISTER_API_KEY: 'register_api_key',
  REGISTER_USER: 'register_user',
  PRINT_CONFIRMATION: 'print_confirmation',
  NEW_NOTIFICATION: 'new_notification',
  TASK_MENTION_CREATED: 'task_mention_created',
} as const

export type WsEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS]
