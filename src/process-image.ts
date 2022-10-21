import * as util from './utils'
import proxy from './utils/proxy'
import { processNodeBackground } from './process-style'

/**
 * 加载图片并返回Img
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param url img url base64 or  url
 * @returns {Promise<HTMLImageElement>} image
 */
export function loadImage(this: any, url: string): Promise<HTMLImageElement> {
  // if (!util.isInlineImage(url)) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 处理跨域图片，注意：IOS 不支持该属性
    // ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
    if (util.isInlineBase64Image(url) || this.options.useCORS) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
    img.alt = ''
    if (img.complete === true) {
      // Inline XML images may fail to parse, throwing an Error later on
      setTimeout(() => resolve(img), 500)
    }
    if (this.options.httpTimeout) {
      setTimeout(
        () => reject(`Timed out (${this.options.httpTimeout}ms) loading image`),
        this.options.httpTimeout,
      )
    }
  })
}

/**
 *  检测图片元素和样式内的背景图，并转换为内联的 Base64形式
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param node HTMLELment 克隆元素
 */
export async function checkElementImgToInline(this: any, node: HTMLElement) {
  const _this = this
  if (node instanceof HTMLImageElement)
    return await setCloneImgSrc.call(_this, node)
  await processNodeBackground.call(this, node)
  const arr = Array.prototype.slice
    .call(node.childNodes)
    .filter((child) => child.nodeType === 1)
  await Promise.all(
    arr.map((child: HTMLElement) => checkElementImgToInline.call(_this, child)),
  )
  return node
}

/**
 * 图片src地址转换成Base64并重新赋值给图片
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param {HTMLImageElement} element
 * @returns {Promise<string>}
 */
async function setCloneImgSrc(
  this: any,
  element: HTMLImageElement,
): Promise<HTMLElement> {
  if (!util.isInlineImage(element.src)) {
    const base64 = await proxy.call(this, element.src)
    this._cache.set(element.src, base64)
    return new Promise(function (resolve, reject) {
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = base64 as string
    })
  }
  return element
}
