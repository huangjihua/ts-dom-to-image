
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
  return `u0000${fourNumberRandom}${index++}`
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

/**
 * 判断字符串是否已 data:开头
 * @param url 
 * @returns {boolean}
 */
export const isDataUrl = (url: string) => {
  return url.search(/^(data:)/) !== -1;
}

/**
 * URL正则
 * @param url 
 * @returns {RegExpConstructor}
 */
export const urlAsRegex = (url: string) => {
  return new RegExp('(url\\([\'"]?)(' + escape(url) + ')([\'"]?\\))', 'g');
}

/**
 * 检查字符串内是否存在 URL 文件资源
 * @param str 
 * @returns 
 */
export const checkStrUrl = (str: string) => str.search(URL_REGEX) !== -1

/**
 * 读取字符并解析出其中 URL
 * @param string 
 * @returns {Array}
 */
export const readUrls = (string: string) => {
  const result: any = [];
  let match;
  while ((match = URL_REGEX.exec(string)) !== null) {
    result.push(match[1]);
  }
  return result.filter(function (url: string) {
    return !isDataUrl(url);
  });
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
 * canvas转Blob
 * @param canvas 
 * @returns 
 */
export const toBlob = (canvas: HTMLCanvasElement) => {
  return new Promise(resolve => {
    const binaryString = window.atob(canvas?.toDataURL().split(',')[1]);
    const length = binaryString.length;
    const binaryArray = new Uint8Array(length);
    for (let i = 0; i < length; i++)
      binaryArray[i] = binaryString.charCodeAt(i);

    resolve(new Blob([binaryArray], {
      type: 'image/png'
    }));
  });
}
