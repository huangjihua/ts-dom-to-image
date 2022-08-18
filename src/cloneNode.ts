import { createImage } from './operateImage';
import { uid } from './utils'

/**
 * 克隆元素样式
 * @param sourceNode 
 * @param cloneNode 
 */
const cloneStyle = (sourceNode: CSSStyleDeclaration, cloneNode: CSSStyleDeclaration) => {
  if (sourceNode.cssText) {
    cloneNode.cssText = sourceNode.cssText
  } else {
    // copyProperties
    for (const key of sourceNode) {
      if (sourceNode.getPropertyValue(key)) {
        cloneNode.setProperty(key,
          sourceNode.getPropertyValue(key),
          sourceNode.getPropertyPriority(key)
        );
      }
    }
  }
}
/**
 * 
 * @param {HTMLElement} node 
 * @param {object} filter 
 * @param {boolean} root 
 * @returns 
 */
export const cloneNode = (node: HTMLElement, filter?: any, root = false) => {
  if (!root && filter && !filter(node)) return Promise.resolve();
  return Promise.resolve(node)
    .then(node => {
      return node instanceof HTMLCanvasElement ? createImage(node.toDataURL()) : node.cloneNode(false)
    })
    .then((clone: any) => {
      var children = node.childNodes; // 子节点
      if (children.length === 0) return Promise.resolve(clone);
      for (const child of children) {
        cloneNode(child as HTMLElement, filter)
          .then(childClone => {
            if (childClone) clone.appendChild(childClone)
          })
      }
      return clone;
    })
    .then((clone: HTMLElement) => processClone(node, clone));


  /**
   * 深度克隆
   * @param {HTMLElement} original  原对象
   * @param {HTMLElement} clone  克隆对象
   */
  function processClone(original: HTMLElement, clone: HTMLElement) {
    if (!(clone instanceof Element)) return clone;
    // 克隆伪类元素，处理样式
    function clonePseudoElements() {
      [':before', ':after'].forEach(function (element) {
        clonePseudoElement(element);
      });

      function clonePseudoElement(element: string) {
        const style = window.getComputedStyle(original, element);
        const content = style.getPropertyValue('content');
        if (content === '' || content === 'none') return;
        const className = uid();
        clone.className = clone.className + ' ' + className;
        const styleElement = document.createElement('style');
        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
        clone.appendChild(styleElement);

        function formatPseudoElementStyle(className: string, element: string, style: CSSStyleDeclaration) {
          const selector = '.' + className + ':' + element;
          const content = style.getPropertyValue('content');
          let cssText = '';
          // 格式化样式
          if (style.cssText) {
            cssText = `${style.cssText} content: ${content};`
          } else {
            for (const key of style) {
              cssText += `${key}:${style.getPropertyValue(key)}${style.getPropertyPriority(key) ? ' !important' : ''};`
            }
          }
          return document.createTextNode(selector + '{' + cssText + '}');
        }
      }
    }

    // 处理用户输入
    function copyUserInput() {
      if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
      if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
    }

    // 处理SVG情况
    function fixSvg() {
      if (!(clone instanceof SVGElement)) return;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      if (!(clone instanceof SVGRectElement)) return;
      ['width', 'height'].forEach((attribute) => {
        var value = clone.getAttribute(attribute);
        if (!value) return;
        clone.style.setProperty(attribute, value);
      });
    }
    return Promise.resolve()
      .then(() => cloneStyle(window.getComputedStyle(original), clone.style))
      .then(clonePseudoElements)
      .then(copyUserInput)
      .then(fixSvg)
      .then(() => clone)
  }
}