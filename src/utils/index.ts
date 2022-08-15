
import { xhr } from './xhr';
import { FILE_ENUM_TYPE } from "./type";

export const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
/**
 * 转义字符串(针对特定符号)
 * @param props  string
 * @returns string
 */
export const escape = (props: string) => props.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
/**
 * 延迟
 * @param delayTime 延迟时间（毫秒）
 */
export const delay = (delayTime: number) => {
  return (args: unknown) => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args)
    }, delayTime)
  })
}
export const uid = () => {
  let index = 0;
  /* see http://stackoverflow.com/a/6248722/2519373 */
  const fourNumberRandom = `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4)
  return ` u0000${fourNumberRandom}${index++}`
}
/**
 * 数组化
 * @param arrayLike 
 * @returns array
 */
export const asArray = (arrayLike: any) => {
  const array: any = [];
  for (const item of arrayLike) {
    array.push(item);
  }
  return array
}
/**
 *  转义 Xhtml
 * @param props String
 * @returns 
 */
export const escapeXhtml = (props: string) => props.replace(/#/g, '%23').replace(/\n/g, '%0A');
/**
 *  处理stylePropertyValue带px
 * @param node HTMLElement
 * @param styleProperty  string
 * @return number
 */
export const px = (node: HTMLElement, styleProperty: string) => {
  const val = window.getComputedStyle(node).getPropertyValue(styleProperty)
  return parseFloat(val.replace('px', ''))
}
export const width = (node: HTMLElement) => {
  const leftBorder = px(node, 'border-left-width');
  const rightBorder = px(node, 'border-right-width');
  return node.scrollWidth + leftBorder + rightBorder;
}

export const height = (node: HTMLElement) => {
  const topBorder = px(node, 'border-top-width');
  const bottomBorder = px(node, 'border-bottom-width');
  return node.scrollHeight + topBorder + bottomBorder;
}

export const dataAsBase64Url = (content: string, type: FILE_ENUM_TYPE) => `data:${type};base64,${content}`

/**
 * 解析URL扩展
 * @param url string
 */
export const parseExtension = (url: string) => {
  const match = /\.([^\.\/]*?)$/g.exec(url);
  return match ? match[1] : ''
}

export const isDataUrl = (url: string) => {
  return url.search(/^(data:)/) !== -1;
}

/**
 * 返回文件的类型
 * @param url string  文件 URL
 * @returns  string
 */
export const ParsefileType = (url: string) => {
  const extension = parseExtension(url).toLocaleUpperCase()
  return FILE_ENUM_TYPE[extension] || ''
}

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
 */
export const imgToBase64Encode = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}) => {
  xhr({
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
}