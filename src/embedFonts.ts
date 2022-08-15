import { URL_REGEX, imgToBase64Encode } from "./utils";
import * as util from './utils';
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
        } else if (rule.style.getPropertyValue('src').search(URL_REGEX) !== -1) {
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
    .then((cssStrings: any[]) => cssStrings.join('\n'))
  return cssText.then(function (cssText: string) {
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
    shouldProcess: (str: string) => str.search(URL_REGEX) !== -1,
    impl: {
      readUrls: readUrls,
      inline: inline,
    },
  };

  function readUrls(string: string) {
    var result: any = [];
    var match;
    while ((match = URL_REGEX.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result.filter(function (url: string) {
      return !util.isDataUrl(url);
    });
  }

  function inline(str: string, url: string, baseUrl: string, get: any) {
    return Promise.resolve(url)
      .then(function (url: string) {
        return baseUrl ? util.createLinkUrl(url, baseUrl) : url;
      })
      .then(get || imgToBase64Encode)
      .then(function (data: string) {
        return util.dataAsBase64Url(data, util.ParsefileType(url));
      })
      .then(function (dataUrl: string) {
        return str.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
      });

    function urlAsRegex(url: string) {
      return new RegExp(
        '(url\\([\'"]?)(' + util.escape(url) + ')([\'"]?\\))',
        'g'
      );
    }
  }

  function inlineAll(str: string, baseUrl: any, get?: any) {
    if (!(str.search(URL_REGEX) !== -1)) return Promise.resolve(str);
    console.log(str, baseUrl);
    return Promise.resolve(str)
      .then(readUrls)
      .then(function (urls: any[]) {
        var done = Promise.resolve(str);
        urls.forEach(function (url: any) {
          done = done.then(function (str: string) {
            return inline(str, url, baseUrl, get);
          });
        });
        return done;
      });
  }
}