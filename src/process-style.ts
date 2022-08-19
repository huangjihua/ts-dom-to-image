import { uid } from "./utils";

/**
 *  设置克隆元素样式
 * @param  {CSSStyleDeclaration} sourceNodeCssStyle
 * @param  {CSSStyleDeclaration} cloneNodeCssStyle 
 */
export const setCloneNodeStyleProperty = (sourceNodeCssStyle: CSSStyleDeclaration, cloneNodeCssStyle: CSSStyleDeclaration) => {
  if (sourceNodeCssStyle.cssText) {
    cloneNodeCssStyle.cssText = sourceNodeCssStyle.cssText
  } else {
    for (const key of sourceNodeCssStyle) {
      if (sourceNodeCssStyle.getPropertyValue(key)) {
        cloneNodeCssStyle.setProperty(key,
          sourceNodeCssStyle.getPropertyValue(key),
          sourceNodeCssStyle.getPropertyPriority(key)
        );
      }
    }
  }
}

/**
 * 处理元素伪类情况
 * @param {HTMLElement} original  用于获取计算样式的Element。
 * @param {HTMLElement} clone  克隆元素（目标对象）
 */
export const processNodePseudoStyle = (original: HTMLElement, clone: HTMLElement) => {
  if (!(clone instanceof Element)) return clone;
  const eachPseudoStyles = () => [':before', ':after'].forEach(item => nodePseudoStyle(item));
  /**
   * 处理伪类
   * @param pseudoName 指定一个要匹配的伪元素的字符串 如:before
   * @returns {void}
   */
  function nodePseudoStyle(pseudoName: string) {
    const style = window.getComputedStyle(original, pseudoName);
    const content = style.getPropertyValue('content');
    if (content === '' || content === 'none') return;
    const className = uid();
    clone.className = clone.className + ' ' + className;
    const styleElement = document.createElement('style');
    styleElement.appendChild(getFormatPseudoStyle(className, pseudoName, style));
    clone.appendChild(styleElement);

    /**
     *  获取格式化后的TextNode
     * @param {string} className 样式名
     * @param {string} pseudoName 伪类名称 
     * @param {CSSStyleDeclaration} style 样式声明对象
     * @returns {TextNode}
     */
    function getFormatPseudoStyle(className: string, pseudoName: string, style: CSSStyleDeclaration) {
      const selector = `.${className}:${pseudoName}`;
      const content = style.getPropertyValue('content');
      let cssText = '';
      if (style.cssText) {
        cssText = `${style.cssText} content: ${content};`
      } else {
        for (const key of style) {
          cssText += `${key}:${style.getPropertyValue(key)}${style.getPropertyPriority(key) ? ' !important' : ''};`
        }
      }
      return document.createTextNode(`${selector}{${cssText}}`);
    }
  }
  // 处理表单元素
  function formCloneElementValue() {
    if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
    if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
  }

  // 处理SVG
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
    .then(() => setCloneNodeStyleProperty(window.getComputedStyle(original), clone.style))
    .then(eachPseudoStyles)
    .then(formCloneElementValue)
    .then(fixSvg)
    .then(() => clone)
}
