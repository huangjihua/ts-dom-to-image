import * as util from "./utils";
import { formCloneElementValue,fixSvg} from './cloneNode'
/**
 *  设置克隆元素样式
 * @param  {CSSStyleDeclaration} sourceNodeCssStyle
 * @param  {CSSStyleDeclaration} cloneNodeCssStyle 
 */
export const setCloneNodeStyleProperty = (sourceNodeCssStyle: CSSStyleDeclaration, cloneNodeCssStyle: CSSStyleDeclaration) => {
  if (sourceNodeCssStyle.cssText) {
    cloneNodeCssStyle.cssText = sourceNodeCssStyle.cssText
    // TODO safari 解析Style兼容问题,100% auto 形式会自动省略 auto，这样会导致生成的背景图图高度会被默认为 100%，结果就是被拉伸了
    if (sourceNodeCssStyle.getPropertyValue('-webkit-background-size') === '100%' && util.checkBrowse().isSafari) {
      cloneNodeCssStyle.cssText = cloneNodeCssStyle.cssText.replace('-webkit-background-size: 100%;', '-webkit-background-size: 100% auto')
    }
  } else {
    for (const key of sourceNodeCssStyle) {
      if (sourceNodeCssStyle.getPropertyValue(key)) {
        console.log(key, sourceNodeCssStyle.getPropertyValue(key), sourceNodeCssStyle.getPropertyPriority(key))
        cloneNodeCssStyle.setProperty(key,
          sourceNodeCssStyle.getPropertyValue(key),
          sourceNodeCssStyle.getPropertyPriority(key)
        );
      }
    }
  }
}


/**
 *  检测图片元素和样式内的背景图，并转换为内联的 Base64形式
 * @param node HTMLELment
 */
export const checkElementImgToInline = async (node: HTMLElement) => {
  if (node.style) {
    const background = node.style.getPropertyValue('background');
    if (!background) return node;
    const value = await util.checkStrUrlFile(background);
    console.log("background:", value);
    if (value) node.style.setProperty('background', value, node.style.getPropertyPriority('background'));
  }
  const arr = Array.prototype.slice.call(node.childNodes).filter(child => child.nodeType === 1)
  await Promise.all(
    arr.map((child: HTMLElement) => {
      return checkElementImgToInline(child);
    })
  )
  return node;
}

/**
 * 处理元素伪类情况
 * @param {HTMLElement} original  原元素
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
    const className = util.uid();
    clone.className = clone.className + ' ' + className;
    const styleElement = document.createElement('style');
    styleElement.appendChild(getFormatPseudoStyle(className, pseudoName, style));
    clone.appendChild(styleElement);
  }
 
  return Promise.resolve()
    .then(() => setCloneNodeStyleProperty(window.getComputedStyle(original), clone.style))
    .then(eachPseudoStyles)
    .then(()=>formCloneElementValue(clone,original))
    .then(() => fixSvg(clone))
    .then(() => clone)
}

/**
 * 处理原始背景外联资源
 * @param node 
 * @returns {void}
 */
export const processNodeBackground =async (node: HTMLElement) => {
  if (node.style) {
    const background = node.style.getPropertyValue('background');
    if (!background) return node;
    const value = await util.checkStrUrlFile(background);
    if (value) node.style.setProperty('background', value, node.style.getPropertyPriority('background'));
  }
}

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