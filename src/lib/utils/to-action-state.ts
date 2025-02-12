export type ActionState = {
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
  message: string | null
  payload: Record<string, unknown> | null
  fieldErrors: Record<string, string[] | undefined> | null
  timestamp: number
}
