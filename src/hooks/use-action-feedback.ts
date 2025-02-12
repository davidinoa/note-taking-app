import { ActionState } from '@/lib/utils/to-action-state'
import { useEffect, useRef } from 'react'

type OnArgs = {
  actionState: ActionState
}

type UseActionFeedbackOptions = {
  onSuccess?: (onArgs: OnArgs) => void
  onError?: (onArgs: OnArgs) => void
}

export const useActionFeedback = (
  actionState: ActionState,
  options: UseActionFeedbackOptions = {},
) => {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (actionState.status === 'SUCCESS') {
      optionsRef.current.onSuccess?.({ actionState })
    }

    if (actionState.status === 'ERROR') {
      optionsRef.current.onError?.({ actionState })
    }
  }, [actionState])
}
