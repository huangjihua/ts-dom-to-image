import * as util from './utils';
import { processNodeBackground } from './process-style'
/**
 * 创建image
 * @param url img url base64 or  url
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = (url: string): Promise<any> => {
  if (url === 'data:,') return Promise.resolve(null)
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
 *  检测图片元素和样式内的背景图，并转换为内联的 Base64形式
 * @param node HTMLELment
 */
export const checkElementImgToInline = async (node: HTMLElement) => {
  if (node instanceof HTMLImageElement) return await imgSrcToInlineBase64(node);
  await processNodeBackground(node)
  const arr = Array.prototype.slice.call(node.childNodes).filter(child => child.nodeType === 1)
  await Promise.all(
    arr.map((child: HTMLElement) => checkElementImgToInline(child))
  )
  return node;
}

/**
 * 图片src地址转换成Base64并重新赋值给图片
 * @param {HTMLImageElement} element 
 * @returns {Promise<string>}
 */
async function imgSrcToInlineBase64(element: HTMLImageElement): Promise<any> {
  if (!util.isDataUrl(element.src)) { 
    const base64 = await util.readUrlFileToBase64({ url: element.src })
    return new Promise(function (resolve, reject) {
      element.onload = resolve;
      element.onerror = reject;
      element.src = base64;
    });
  }
}
