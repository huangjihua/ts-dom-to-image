
import { xhr } from './xhr';
import * as util from './tool';
const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
/**
 * 图转成Base64编码
 * @param props :{
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}
 */
export const imgToBase64Encode = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}) => {
  xhr({
    ...props, successHandle: (request, resolve) => {
      const encoder = new FileReader();
      encoder.onloadend = function () {
        let content = encoder.result;
        if (content && typeof content === 'string') content = content.split(/,/)[1]
        resolve(content);
      };
      encoder.readAsDataURL(request.response);
    }
  })
}

/**
 * 嵌入字体
 * @param node 
 * @returns 
 */
export const embedFonts = (node) => {
  return newFontFaces().resolveAll().then(function (cssText) {
    var styleNode = document.createElement('style');
    node.appendChild(styleNode);
    styleNode.appendChild(document.createTextNode(cssText));
    return node;
  });
}


function newFontFaces() {
  return {
    resolveAll: resolveAll,
    impl: {
      readAll: readAll,
    },
  };

  function resolveAll() {
    return readAll()
      .then(function (webFonts) {
        return Promise.all(
          webFonts.map(webFont => webFont.resolve())
        );
      })
      .then(function (cssStrings) {
        return cssStrings.join('\n');
      });
  }

  function readAll() {
    return Promise.resolve(document.styleSheets)
      .then(selectWebFontRules)
      .then(function (rules) {
        return rules.map(newWebFont);
      });

    function selectWebFontRules(styleSheets) {
      const cssRules = styleSheets.cssRules
      let result: any = [];
      for (const rule of cssRules) {
        if (rule.type === CSSRule.FONT_FACE_RULE) {
          result.push(rule)
        } else if (rule.style.getPropertyValue('src').search(URL_REGEX) !== -1) {
          result.push(rule)
        }
      }
      return result;
    }
  }

  function newWebFont(webFontRule) {
    return {
      resolve: function resolve() {
        var baseUrl = (webFontRule.parentStyleSheet || {}).href;
        return newInliner().inlineAll(webFontRule.cssText, baseUrl);
      },
      src: function () {
        return webFontRule.style.getPropertyValue('src');
      },
    };
  }
}



/**
   * 外联资源转内联
   */
function newInliner() {

  return {
    inlineAll: inlineAll,
    shouldProcess: shouldProcess,
    impl: {
      readUrls: readUrls,
      inline: inline,
    },
  };

  function shouldProcess(string) {
    return string.search(URL_REGEX) !== -1;
  }

  function readUrls(string) {
    var result = [];
    var match;
    while ((match = URL_REGEX.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result.filter(function (url) {
      return !util.isDataUrl(url);
    });
  }

  function inline(string, url, baseUrl, get) {
    return Promise.resolve(url)
      .then(function (url) {
        return baseUrl ? util.createLinkUrl(url, baseUrl) : url;
      })
      .then(get || imgToBase64Encode)
      .then(function (data) {
        return util.dataAsBase64Url(data, util.ParsefileType(url));
      })
      .then(function (dataUrl) {
        return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
      });

    function urlAsRegex(url) {
      return new RegExp(
        '(url\\([\'"]?)(' + util.escape(url) + ')([\'"]?\\))',
        'g'
      );
    }
  }

  function inlineAll(string, baseUrl, get?) {
    if (nothingToInline()) return Promise.resolve(string);
    console.log(string, baseUrl);
    return Promise.resolve(string)
      .then(readUrls)
      .then(function (urls) {
        var done = Promise.resolve(string);
        urls.forEach(function (url) {
          done = done.then(function (string) {
            return inline(string, url, baseUrl, get);
          });
        });
        return done;
      });

    function nothingToInline() {
      return !shouldProcess(string);
    }
  }
}