type SseController = ReadableStreamDefaultController<Uint8Array>

const channels = new Map<string, Set<SseController>>()

export function subscribe(endpointId: string, controller: SseController) {
  let set = channels.get(endpointId)
  if (!set) {
    set = new Set()
    channels.set(endpointId, set)
  }
  set.add(controller)
}

export function unsubscribe(endpointId: string, controller: SseController) {
  const set = channels.get(endpointId)
  if (!set) return
  set.delete(controller)
  if (set.size === 0) channels.delete(endpointId)
}

export function broadcast(endpointId: string, event: string, data: unknown) {
  const set = channels.get(endpointId)
  if (!set) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(payload)
  for (const controller of set) {
    try {
      controller.enqueue(encoded)
    } catch {
      set.delete(controller)
    }
  }
}

export function createSseStream(endpointId: string) {
  let controllerRef: SseController | null = null
  let keepalive: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller
      subscribe(endpointId, controller)
      controller.enqueue(new TextEncoder().encode(': connected\n\n'))

      keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'))
        } catch {
          if (keepalive) clearInterval(keepalive)
        }
      }, 15_000)
    },
    cancel() {
      if (keepalive) clearInterval(keepalive)
      if (controllerRef) unsubscribe(endpointId, controllerRef)
    },
  })

  return stream
}
