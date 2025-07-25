import { useRequest, type Options as UseRequestOptions } from 'vue-request'

import type { Endpoints } from '@/endpoints'
import { toast } from 'vue-sonner'
import type { WatchSource } from 'vue'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Sends an HTTP request to the specified URL with the provided options.
 *
 * @param url - The URL to send the request to.
 * @param options - Optional configuration for the request.
 * @param options.method - The HTTP method to use. Defaults to 'GET'.
 * @param options.payload - The payload to send in the request body for non-GET/DELETE requests.
 * @throws Will throw an error if the response status is not OK.
 */
export async function request<T = any>(
  url: URL,
  options?: {
    method?: HttpMethod
    payload?: any
  }
): Promise<T> {
  options = options ?? {}
  const method = options.method ?? 'GET'

  // Construct the headers
  const headers = new Headers()
  headers.append(
    'Authorization',
    `Bearer ${localStorage.getItem('accessToken')}`
  )
  if (method !== 'GET' && method !== 'DELETE') {
    headers.append('Content-Type', 'application/json')
    if (!options.payload) {
      options.payload = {}
    }
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(options.payload),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    })

    const result = await response.json()

    if (!response.ok) {
      throw result
    }
    return result
  } catch (error: any) {
    if (error.code) {
      toast({
        title:
          error.code === 401
            ? 'Please connect your wallet first'
            : error.message,
      })
    }
    throw error
  }
}

/**
 * Returns a URL constructed from the given endpoint and params.
 *
 * @param path - The path to construct the URL from.
 * @param params - The search parameters and path parameters to include in the constructed URL.
 */
export function getUrl(path: string, params: Dict = {}) {
  // URL path parameters
  const names = path.match(/:\w+/g)
  if (names !== null) {
    for (let name of names) {
      name = name.slice(1)
      path = path.replace(`:${name}`, params[name])
      delete params[name]
    }
  }

  const url = new URL(path, import.meta.env.VITE_API_URL)

  // URL search parameters
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.append(key, value)
    }
  }

  return url
}

/**
 * Returns a hook to make requests to the specified endpoint provided in the
 * argument with optional parameters. The generic types T and K represent the
 * endpoint and http method respectively.
 *
 * @param endpoint - The API endpoint to make the request to.
 * @param options
 * @param options.method - The HTTP method to use to make the request.
 * @param options.payload - An optional payload to send in the request.
 * @param options.params - An optional object containing
 * the search parameters and path parameters to be sent in the request.
 * @param options.refreshDeps - An array of dependencies to refresh the request.
 * @param options.manual - Whether to make the request manually. Defaults to true.
 * @param options.ready - Whether to make the request immediately.
 */
export function useEndpoint<
  T extends keyof Endpoints,
  K extends keyof Endpoints[T]
>(
  endpoint: T,
  // @ts-ignore
  options: UseRequestOptions<Endpoints[T][K]['data'], any> & {
    method: K
    // @ts-ignore
    payload?: Endpoints[T][K]['payload']
    // @ts-ignore
    params?: Endpoints[T][K]['params']
  } = {}
) {
  // @ts-ignore
  type TData = Endpoints[T][K]['data']
  // @ts-ignore
  type TPayload = Endpoints[T][K]['payload']
  // @ts-ignore
  type TParams = Endpoints[T][K]['params']

  return useRequest<TData, [TPayload?, TParams?]>(
    function (payload = options.payload, params = options.params) {
      return request(getUrl(endpoint, params as Dict), {
        method: options.method as HttpMethod,
        payload: payload,
      })
    },
    {
      errorRetryCount: 0,
      refreshDeps: [
        ...Object.values(options.payload ?? {}).map(
          (value) => value as WatchSource
        ),
        ...Object.values(options.params ?? {}).map(
          (value) => value as WatchSource
        ),
        ...(Array.isArray(options.refreshDeps)
          ? options.refreshDeps
          : ([] as WatchSource[])),
      ],
      manual: options.manual ?? true,
      ready: options.ready,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onAfter: options.onAfter,
    }
  )
}
