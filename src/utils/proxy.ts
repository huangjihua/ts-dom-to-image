import { isResponseTypeToString } from "../utils"

/**
 * 读取Url 文件并转成Base64字符串
 * proxy 参数null 不走转发代理
 *
 * @export
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param {string} url
 * @returns {Promise<string>}
 */
export default function proxy(this: any, url: string): Promise<string> {
  const { proxy = null, httpTimeout = 30000, cacheBust = false } = this?.options || { proxy: null, httpTimeout: 30000, cacheBust: false }
  if (cacheBust) {
    // Cache bypass so we dont have CORS issues with cached images
    // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime()
  }
  return new Promise((resolve, reject) => {
    const responseType = isResponseTypeToString() ? 'blob' : 'text';
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        if (responseType === 'text') {
          resolve(xhr.response);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (e) => reject(e)
          reader.readAsDataURL(xhr.response);
        }
      } else {
        reject(`Failed to proxy resource ${url} with status code ${xhr.status}`)
      }
    };

    xhr.onerror = reject;
    if (proxy) {
      const queryString = proxy.indexOf('?') > -1 ? '&' : '?';
      xhr.open('GET', `${proxy}${queryString}url=${encodeURIComponent(url)}&responseType=${responseType}`);
    } else {
      xhr.open('GET', url);
    }
    if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
      xhr.responseType = responseType;
    }
    if (httpTimeout) {
      xhr.timeout = httpTimeout;
      xhr.ontimeout = () => reject(`Timed out (${httpTimeout}ms) proxying ${url}`);
    }
    xhr.send();
  })
}