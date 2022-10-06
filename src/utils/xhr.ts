/**
 *  XMLHttpRequest
 * @param props
 * @returns
 */
export const xhr = (props: {
  url: string
  httpTimeout?: number
  cacheBust?: boolean // 是否绕过缓存
  useCredentials?: boolean // 是否跨域
  successHandle?: Function | undefined
  failHandle?: Function | undefined
}) => {
  let { url } = props
  const {
    httpTimeout = 30000,
    cacheBust = false,
    useCredentials = false,
    successHandle,
    failHandle,
  } = props
  if (cacheBust) {
    // Cache bypass so we dont have CORS issues with cached images
    // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime()
  }
  return new Promise(function (resolve, reject) {
    const request = new XMLHttpRequest()
    request.onreadystatechange = handle
    request.ontimeout = () => reject(`timeout of ${httpTimeout}ms occured while fetching resource: ${url}`)

    request.responseType = 'blob'
    request.timeout = httpTimeout
    if (useCredentials) request.withCredentials = true // 如果服务端设置了"Access-Control-Allow-Origin": "*"，客户端请求时无需再设置withCredentials: true
    request.open('GET', url, true)
    request.send()
    request.onerror = reject;
    function handle() {
      if (request.readyState !== 4) return
      if (request.status === 200) {
        if (successHandle instanceof Function) {
          successHandle(request, resolve)
        } else {
          resolve(request)
        }
      } else {
        if (failHandle instanceof Function) {
          failHandle(request, reject)
        } else {
          reject(`cannot fetch resource: ${url}, status: ${request.status}`)
        }
      }
    }
  })
}
