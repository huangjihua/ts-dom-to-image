import * as util from './utils';
import { xhr } from './utils/xhr';
import { inlineFileAll } from './inlineUrlFiles'


/**
 * 创建 img
 * @param url img url base64 or  url
 * @returns img promise
 */
export const createImage = (url: string) => {
  if (url === 'data:,') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 处理跨域图片，注意：IOS 不支持该属性
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve(img);
    }
    img.onerror = reject
    img.src = url;
  })
}

/**
 * 生成新的 URL
 * @param url 
 * @param baseUrl 
 * @returns 
 */
export const createLinkUrl = (url: string, baseUrl: string): string => {
  var doc = document.implementation.createHTMLDocument();
  var base = doc.createElement('base');
  doc.head.appendChild(base);
  var a = doc.createElement('a');
  doc.body.appendChild(a);
  base.href = baseUrl;
  a.href = url;
  console.log(url);
  return a.href;
}

/**
 * 图转成Base64编码
 * @param props :{
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}
@return {Promise}
 */
export const imgToEncode = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}): Promise<any> => xhr({
  ...props, successHandle: (request: { response: Blob; }, resolve: (arg0: string | ArrayBuffer | null) => void) => {
    const encoder = new FileReader();
    encoder.onloadend = function () {
      let content = encoder.result;
      if (content && typeof content === 'string') content = content.split(/,/)[1]
      resolve(content);
    };
    encoder.readAsDataURL(request.response);
  }
})

/**
 * 生成新图像
 * @returns 
 */
export const newImages = () => {
  return {
    inlineAll: inlineAll,
  };

  function newImage(element: HTMLImageElement) {
    return {
      inline: inline
    };

    function inline() {
      if (util.isDataUrl(element.src)) return Promise.resolve();
      return Promise.resolve(element.src)
        .then((url) => imgToEncode({ url: url }))
        .then((data) => util.dataAsBase64Url(data, util.ParsefileType(element.src)))
        .then((dataUrl) => {
          return new Promise(function (resolve, reject) {
            element.onload = resolve;
            element.onerror = reject;
            element.src = dataUrl;
          });
        });
    }
  }

  function inlineAll(node: HTMLElement) {
    if (!(node instanceof Element)) return Promise.resolve(node);

    return inlineBackground(node)
      .then(function () {
        if (node instanceof HTMLImageElement)
          return newImage(node).inline();
        else
          return Promise.all(
            util.asArray(node.childNodes).map((child: HTMLElement) => {
              return inlineAll(child);
            })
          );
      });

    // 处理样式中的图片资源
    function inlineBackground(node: HTMLElement) {
      var background = node.style.getPropertyValue('background');

      if (!background) return Promise.resolve(node);

      return inlineFileAll(background)
        .then((inlined: string) => {
          node.style.setProperty(
            'background',
            inlined,
            node.style.getPropertyPriority('background')
          );
        })
        .then(function () {
          return node;
        });
    }
  }
}

export const inlineImages = (node: any) => {
  return newImages().inlineAll(node).then(() => node);
}