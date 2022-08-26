import * as util from './utils';
import { createLinkUrl, readUrlFileToEncode } from "./process-image";
/**
 * 嵌入字体
 * @param node 
 * @returns 
 */
export const embedFonts = (node: HTMLElement) => {
  const readAllFont: any = (styleSheets: StyleSheetList) => {
    const cssRules: Array<any> = []
    for (const sheet of styleSheets) {
      for (const cssRule of sheet.cssRules) {
        cssRules.push.bind(cssRule, sheet.cssRules)
      }
    }
    let newFonts = []
    const newWebFont = (rule: { parentStyleSheet: any; cssText: any; style: { getPropertyValue: (arg0: string) => string; }; }) => {
      const resolve = () => {
        const baseUrl = (rule.parentStyleSheet || {}).href;
        return newInliner(rule.cssText, baseUrl);
      }
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
 * 字体Url File转换为Base64
 * @param str 字符内容
 * @param baseUrl url
 * @returns 
 */
function newInliner(str: string, baseUrl: string) {
  if (!util.checkStrUrl(str)) return Promise.resolve(str);
  // console.log(str, baseUrl);
  const urls = util.readUrls(str);
  let done = Promise.resolve(str);
  urls.forEach((url: string) => {
    done = done.then(async (str: string) => {
      url = baseUrl ? createLinkUrl(url, baseUrl) : url;
      const imgData: string = await readUrlFileToEncode({ url: url })
      const base64 = util.dataAsBase64Url(imgData, util.ParsefileType(url));
      return str.replace(util.urlAsRegex(url), '$1' + base64 + '$3');;
    });
  });
  return done;
}