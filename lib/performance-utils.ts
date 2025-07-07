// Performance optimization utilities
export const preloadResource = (href: string, as: string) => {
  if (typeof window !== "undefined") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

export const preloadImage = (src: string) => {
  if (typeof window !== "undefined") {
    const img = new Image()
    img.src = src
  }
}

export const optimizeImage = (src: string, width?: number, height?: number) => {
  const params = new URLSearchParams()
  if (width) params.set("w", width.toString())
  if (height) params.set("h", height.toString())
  params.set("q", "85") // Quality
  params.set("f", "webp") // Format

  return `${src}?${params.toString()}`
}

export const createCacheKey = (prefix: string, params: Record<string, any>) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key]
        return result
      },
      {} as Record<string, any>,
    )

  return `${prefix}:${JSON.stringify(sortedParams)}`
}

export const memoizeWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
): T => {
  const cache = new Map<string, { value: ReturnType<T>; expires: number }>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)

    if (cached && cached.expires > Date.now()) {
      return cached.value
    }

    const result = fn(...args)
    cache.set(key, {
      value: result,
      expires: Date.now() + ttl,
    })

    return result
  }) as T
}

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}
