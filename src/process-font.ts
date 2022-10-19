import * as util from './utils'
/**
 * 处理嵌入字体
 * @param node
 * @returns
 */
export function processFonts(this: any, node: HTMLElement) {
  const pNewFonts = readAllFont.call(this, document.styleSheets)
  const cssText = Promise.all(
    pNewFonts.map((webFont: { resolve: () => Promise<string> }) =>
      webFont.resolve(),
    ),
  ).then((cssStrings: string[]) => cssStrings.join('\n'))

  return cssText.then((cssText: string) => {
    const styleNode = document.createElement('style')
    // console.log(cssText)
    node.appendChild(styleNode)
    styleNode.appendChild(document.createTextNode(cssText))
    return node
  })
}

/**
 * 解析 document.styleSheets返回新的font
 * @param {DomToImage}this 隐含的 DomToImage 对象,非参数
 * @param styleSheets
 * @returns {Array} newFont
 */
function readAllFont(this: any, styleSheets: StyleSheetList) {
  const newFonts: any = []
  const cssRules: Array<any> = []
  for (const sheet of styleSheets) {
    for (const cssRule of sheet.cssRules) {
      if (cssRule.type === 5) {
        cssRules.push(cssRule)
      }
    }
  }
  const newWebFont = (rule: {
    parentStyleSheet: StyleSheet
    cssText: string
    style: {
      getPropertyValue: (arg0: string) => string
    }
  }) => {
    const resolve = () =>
      util.checkStrUrlFile.call(
        this,
        rule.cssText,
        rule.parentStyleSheet?.href || undefined,
      )
    const src = () => rule.style.getPropertyValue('src')
    return { resolve, src }
  }
  try {
    for (const rule of cssRules) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        // console.log(rule)
        newFonts.push(newWebFont(rule))
      } else if (util.checkStrUrl(rule.style.getPropertyValue('src'))) {
        newFonts.push(newWebFont(rule))
      }
    }
  } catch (e) {
    console.log('Error while reading CSS rules from ' + styleSheets, e)
  }
  return newFonts
}
