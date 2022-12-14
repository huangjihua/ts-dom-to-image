import proxy from './proxy'
import { FILE_ENUM_TYPE } from './type'
import Cache from './cache'

const INLINE_FONT_IMG = /^data:(image|font)\/.*/i;
const INLINE_SVG = /^data:image\/svg\+xml/i;
const INLINE_IMG = /^data:image\/.*/i;
const INLINE_BASE64 = /^data:image\/.*;base64,/i;
const CHECK_IMAG = /.(jpg|png|gif|webp)$/i;
export const isInLineFontOrImage = (src: string): boolean => INLINE_FONT_IMG.test(src)
export const isInlineSVG = (src: string): boolean => INLINE_SVG.test(src)
export const isInlineImage = (src: string): boolean => INLINE_IMG.test(src);
export const isInlineBase64Image = (src: string): boolean => INLINE_BASE64.test(src);
export const isBlobImage = (src: string): boolean => src.substr(0, 4) === 'blob';
export const isImage = (src: string): boolean => CHECK_IMAG.test(src)
export const isImageSuportCORS = (): boolean => typeof new Image().crossOrigin !== 'undefined';
export const isResponseTypeToString = (): boolean => typeof new XMLHttpRequest().responseType === 'string';
export const checkBrowse = () => {
  const ua = navigator.userAgent
  return {
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(ua),
    isIos: /(iPhone|iPad|iPod|iOS)/i.test(ua),
  }
}
export const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g
/**
 * 转义字符串(针对特定符号)
 * @param props  string
 * @returns string
 */
export const escape = (props: string) =>
  props.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1')
/**
 * 延迟
 * @param delayTime 延迟时间（毫秒）
 */
export const delay = (delayTime: number) => new Promise(resolve => setTimeout(resolve, delayTime))
export const uid = () => {
  let index = 0
  /* see http://stackoverflow.com/a/6248722/2519373 */
  const fourNumberRandom = `0000${(
    (Math.random() * Math.pow(36, 4)) <<
    0
  ).toString(36)}`.slice(-4)
  return `u0000${fourNumberRandom}${index++}`
}
/**
 * 数组化
 * @param arrayLike
 * @returns array
 */
export const asArray = (arrayLike: any) => {
  const array: any = []
  for (const item of arrayLike) {
    array.push(item)
  }
  return array
}
/**
 *  转义 Xhtml
 * @param props String
 * @returns
 */
export const escapeXhtml = (props: string) => props.replace(/#/g, '%23').replace(/\n/g, '%0A')
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
  const leftBorder = px(node, 'border-left-width')
  const rightBorder = px(node, 'border-right-width')
  return node.scrollWidth + leftBorder + rightBorder
}

export const height = (node: HTMLElement) => {
  const topBorder = px(node, 'border-top-width')
  const bottomBorder = px(node, 'border-bottom-width')
  return node.scrollHeight + topBorder + bottomBorder
}

export const dataAsBase64Url = (content: string, type: FILE_ENUM_TYPE) =>
  `data:${type};base64,${content}`

/**
 * 解析URL扩展
 * @param url string
 */
export const parseExtension = (url: string) => {
  const match = /\.([^\.\/]*?)$/g.exec(url)
  return match ? match[1] : ''
}

/**
 * URL正则
 * @param url
 * @returns {RegExpConstructor}
 */
export const urlAsRegex = (url: string) => {
  return new RegExp('(url\\([\'"]?)(' + escape(url) + ')([\'"]?\\))', 'g')
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
  const result: any = []
  let match
  while ((match = URL_REGEX.exec(string)) !== null) {
    result.push(match[1])
  }
  return result.filter((url: string) => !isInLineFontOrImage(url))
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
  return new Promise((resolve) => {
    const binaryString = window.atob(canvas?.toDataURL().split(',')[1])
    const length = binaryString.length
    const binaryArray = new Uint8Array(length)
    for (let i = 0; i < length; i++) binaryArray[i] = binaryString.charCodeAt(i)

    resolve(
      new Blob([binaryArray], {
        type: 'image/png',
      }),
    )
  })
}
/**
 *  将blob转化为dataUrl
 * 
 * @export
 * @param {Blob} blob
 * @returns
 */
export async function blobToDataURL(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader()
    reader.onload = async (e: any) => {
      resolve(e.target.result)
    }
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(blob)
  })
}


/**
 * 生成新的 URL
 * @param url
 * @param baseUrl
 * @returns
 */
export const createLinkUrl = (url: string, baseUrl: string): string => {
  const doc = document.implementation.createHTMLDocument()
  const base = doc.createElement('base')
  doc.head.appendChild(base)
  const a = doc.createElement('a')
  doc.body.appendChild(a)
  base.href = baseUrl
  a.href = url
  console.log(url)
  return a.href
}

/**
 * 检测字符内所有的url File,并转成内联的 base64地址
 * @param {string} str
 * @param {string} baseUrl
 * @returns {Promise<string>}
 */
export function checkStrUrlFile(this: any, str: string, baseUrl?: string) {
  if (!checkStrUrl(str)) return Promise.resolve(str)
  // console.log(str, baseUrl)
  const urls = readUrls(str)
  let done = Promise.resolve(str)
  urls.forEach((url: string) => {
    done = done.then(async (str) => {
      url = baseUrl ? createLinkUrl(url, baseUrl) : url
      let content;
      if (this._cache.has(url)) {
        content = this._cache.get(url)
      } else {
        content = await proxy.call(this, url)
        this._cache.set(url, content as string)
      }
      // console.log(content);
      return str.replace(urlAsRegex(url), '$1' + content + '$3')
    })
  })
  return done
}