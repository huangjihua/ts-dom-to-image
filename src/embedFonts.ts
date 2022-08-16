import * as util from './utils';
import { createLinkUrl, imgToEncode } from "./operateImage";
/**
 * 嵌入字体
 * @param node 
 * @returns 
 */
export const embedFonts = (node: { appendChild: (arg0: HTMLStyleElement) => void; }) => {
  const readAllFont: any = (styleSheets: { cssRules: any; href: string; }) => {
    const cssRules = styleSheets.cssRules
    let newFonts = []
    const newWebFont = (rule: { parentStyleSheet: any; cssText: any; style: { getPropertyValue: (arg0: string) => string; }; }) => {
      const resolve = () => {
        const baseUrl = (rule.parentStyleSheet || {}).href;
        return newInliner().inlineAll(rule.cssText, baseUrl);
      }
      const src = () => rule.style.getPropertyValue('src')
      return { resolve, src };
    }
    try {
      for (const rule of cssRules) {
        if (rule.type === CSSRule.FONT_FACE_RULE) {
          newFonts.push(newWebFont(rule))
        } else if (rule.style.getPropertyValue('src').search(util.URL_REGEX) !== -1) {
          newFonts.push(newWebFont(rule))
        }
      }
    } catch (e) {
      console.log('Error while reading CSS rules from ' + styleSheets.href, e);
    }
    return newFonts;
  }
  const cssText = Promise.all(
    readAllFont.map((webFont: { resolve: () => Promise<any>; }) => webFont.resolve()))
    .then((cssStrings: any[]) => cssStrings.join('\n'));

  return cssText.then((cssText: string) => {
    var styleNode = document.createElement('style');
    node.appendChild(styleNode);
    styleNode.appendChild(document.createTextNode(cssText));
    return node;
  });
}







/**
   * 外联资源转内联
   */
function newInliner() {
  return {
    inlineAll: inlineAll,
    shouldProcess: (str: string) => str.search(util.URL_REGEX) !== -1,
    // impl: {
    //   readUrls: readUrls,
    //   inline: inline,
    // },
  };



  async function inline(str: string, url: string, baseUrl: string) {
    url = baseUrl ? createLinkUrl(url, baseUrl) : url;
    let result = ''
    const imgData: string = await imgToEncode({ url: url })
    const base64 = util.dataAsBase64Url(imgData, util.ParsefileType(url));
    result = str.replace(util.urlAsRegex(url), '$1' + base64 + '$3');
    return result;
  }

  function inlineAll(str: string, baseUrl: any) {
    if (!(str.search(util.URL_REGEX) !== -1)) return Promise.resolve(str);
    console.log(str, baseUrl);
    const urls = util.readUrls(str);
    let done = Promise.resolve(str);
    urls.forEach((url: string) => {
      done = done.then((str: string) => {
        return inline(str, url, baseUrl);
      });
    });
    return done;
  }
}