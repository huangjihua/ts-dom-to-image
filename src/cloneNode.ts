import { createImage } from './operateImage';
import { processNodePseudoStyle } from './process-style';

/**
 * 克隆元素
 * @param {HTMLElement} node 
 * @param {object} filter 
 * @param {boolean} root 
 * @returns 
 */
export const cloneNode = async (node: HTMLElement, filter?: any, root = false) => {
  if (!root && filter && !filter(node)) return;
  var children = node.childNodes;
  const clone: any = node instanceof HTMLCanvasElement ? await createImage(node.toDataURL()) : node.cloneNode(false)
  processNodePseudoStyle(node, clone)
  if (children.length === 0) return clone;
  for (const child of children) {
    cloneNode(child as HTMLElement, filter)
      .then((childClone: any) => {
        if (childClone) {
          clone.appendChild(childClone)
        }
      })
  }
  return clone
}