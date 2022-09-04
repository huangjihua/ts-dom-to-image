/**
 *  XMLHttpRequest
 * @param props 
 * @returns 
 */
export const xhr = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean, // 是否绕过缓存
  useCredentials?: boolean, // 是否跨域
  successHandle?: Function,
  failHandle?: Function
}) => {
  let { url } = props;
  const {
    httpTimeout = 30000,
    cacheBust = false,
    useCredentials = false,
    successHandle = () => { },
    failHandle = () => { },
  } = props;
  if (cacheBust) {
    // Cache bypass so we dont have CORS issues with cached images 
    // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
  }
  return new Promise(function (resolve) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = handle;
    request.ontimeout = () => fail(`timeout of ${httpTimeout}ms occured while fetching resource: ${url}`);;
    request.responseType = 'blob';
    request.timeout = httpTimeout;
    if (useCredentials) request.withCredentials = true; // 如果服务端设置了"Access-Control-Allow-Origin": "*"，客户端请求时无需再设置withCredentials: true
    request.open('GET', url, true);
    request.send();

    function handle() {
      if (request.readyState !== 4) return;
      if (request.status === 200) {
        successHandle(request, resolve)
      } else {
        failHandle();
        fail('cannot fetch resource: ' + url + ', status: ' + request.status);
        return;
      }

    }
    function fail(message: string) {
      console.error(message);
      resolve('');
    }
  });
}