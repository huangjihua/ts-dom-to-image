import { FILE_ENUM_TYPE } from "./Type";
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
  return args => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args)
    }, delayTime)
  })
}
/**
 * 数组化
 * @param arrayLike 
 * @returns array
 */
export const asArray = (arrayLike) => {
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
 * 返回文件的类型
 * @param url string  文件 URL
 * @returns  string
 */
export const ParsefileType = (url) => {
  const extension = parseExtension(url).toLocaleUpperCase()
  return FILE_ENUM_TYPE[extension] || ''
}

/**
 * 创建 img
 * @param url img url base64 or  url
 * @returns img promise
 */
export const createImage = (url) => {
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