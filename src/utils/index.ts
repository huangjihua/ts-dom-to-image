
export const getEncode = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string
}) => {
  let { url } = props;
  const { httpTimeout = 30000, cacheBust = false, useCredentials = false, imagePlaceholder } = props;
  if (cacheBust) {
    // Cache bypass so we dont have CORS issues with cached images
    // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
  }
  return new Promise(function (resolve) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = done;
    request.ontimeout = timeout;
    request.responseType = 'blob';
    request.timeout = httpTimeout;
    if (props.useCredentials) {
      request.withCredentials = true;
    }
    request.open('GET', url, true);
    request.send();

    let placeholder;
    if (imagePlaceholder) {
      const split = imagePlaceholder.split(/,/);
      if (split && split[1]) {
        placeholder = split[1];
      }
    }

    function done() {
      if (request.readyState !== 4) return;
      if (request.status !== 200) {
        if (placeholder) {
          resolve(placeholder);
        } else {
          fail(
            'cannot fetch resource: ' + url + ', status: ' + request.status
          );
        }

        return;
      }

      const encoder = new FileReader();
      encoder.onloadend = function () {
        let content = encoder.result;
        if (content && typeof content === 'string') content = content.split(/,/)[1]
        resolve(content);
      };
      encoder.readAsDataURL(request.response);
    }

    function timeout() {
      if (placeholder) {
        resolve(placeholder);
      } else {
        fail(`timeout of ${httpTimeout}ms occured while fetching resource: ${url}`);
      }
    }

    function fail(message) {
      console.error(message);
      resolve('');
    }
  });
}