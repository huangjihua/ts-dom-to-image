import { loadImage } from './process-image'
import { processNodePseudoStyle } from './process-style'

/**
 * 克隆元素
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param {HTMLElement} node
 * @param {Function} filter
 * @param {boolean} root
 * @returns
 */
export async function cloneNode(this: any, node: HTMLElement, root = false) {
  const { filter } = this.options
  if (!root && filter && !filter(node)) return
  if (node.nodeType === 8) return // 排除注释
  const children = node.childNodes
  const clone: HTMLElement =
    node instanceof HTMLCanvasElement
      ? await loadImage.call(this, node.toDataURL())
      : (node.cloneNode(false) as HTMLElement)
  processNodePseudoStyle(node, clone)
  if (children.length === 0) return clone
  for (const child of children) {
    cloneNode.call(this, child as HTMLElement, filter).then((childClone) => {
      if (childClone) {
        clone.appendChild(childClone)
      }
    })
  }
  return clone
}

/**
 * 处理表单元素
 * @param {HTMLElement} clone  克隆元素（目标对象）
 * @param {HTMLElement} original  原元素
 */
export const formCloneElementValue = (
  clone: HTMLElement,
  original: HTMLElement,
) => {
  if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value
  if (original instanceof HTMLInputElement)
    clone.setAttribute('value', original.value)
}

/**
 * 处理SVG
 * @param clone
 * @returns
 */
export const fixSvg = (clone: HTMLElement) => {
  if (!(clone instanceof SVGElement)) return
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (!(clone instanceof SVGRectElement)) return
  ;['width', 'height'].forEach((attribute) => {
    const value = clone.getAttribute(attribute)
    if (!value) return
    clone.style.setProperty(attribute, value)
  })
}
