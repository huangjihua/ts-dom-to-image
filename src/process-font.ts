import * as util from './utils';
/**
 * 处理嵌入字体
 * @param node 
 * @returns 
 */
export const processFonts = (node: HTMLElement) => {
 
  const pNewFonts = readAllFont(document.styleSheets)
  const cssText = Promise.all(
    pNewFonts.map((webFont: { resolve: () => Promise<any>; }) => webFont.resolve()))
    .then((cssStrings: any[]) => cssStrings.join('\n'));

  return cssText.then((cssText: string) => {
    const styleNode = document.createElement('style');
    node.appendChild(styleNode);
    styleNode.appendChild(document.createTextNode(cssText));
    return node;
  });
}

/**
 * 解析 document.styleSheets返回新的font
 * @param styleSheets 
 * @returns {Array} newFont
 */
function readAllFont (styleSheets: StyleSheetList) {
  let newFonts: any = []
  const cssRules: Array<any> = []
  for (const sheet of styleSheets) {
    for (const cssRule of sheet.cssRules) {
      cssRules.push.bind(cssRule, sheet.cssRules)
    }
  }
  const newWebFont = (rule: { parentStyleSheet: any; cssText: any; style: { getPropertyValue: (arg0: string) => string; }; }) => {
    const resolve = () => util.checkStrUrlFile(rule.cssText, (rule.parentStyleSheet || {}).href);
    const src = () => rule.style.getPropertyValue('src')
    return { resolve, src };
  }
  try {
    for (const rule of cssRules) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        newFonts.push(newWebFont(rule))
      } else if (util.checkStrUrl(rule.style.getPropertyValue('src'))) {
        newFonts.push(newWebFont(rule))
      }
    }
  } catch (e) {
    console.log('Error while reading CSS rules from ' + styleSheets, e);
  }
  return newFonts;
}