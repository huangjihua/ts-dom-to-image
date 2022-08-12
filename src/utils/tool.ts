import { FILE_ENUM_TYPE } from "./Type";
/**
 * 转义字符串(针对特定符号)
 * @param props  string
 * @returns string
 */
export const escape = (props: string) => props.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
/**
 * 延迟
 * @param delayTime 延迟时间（毫秒）
 */
export const delay = (delayTime: number) => {
  return args => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args)
    }, delayTime)
  })
}
export const uid = () => {
  let index = 0;
  /* see http://stackoverflow.com/a/6248722/2519373 */
  const fourNumberRandom = `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4)
  return ` u0000${fourNumberRandom}${index++}`
}
/**
 * 数组化
 * @param arrayLike 
 * @returns array
 */
export const asArray = (arrayLike) => {
  const array: any = [];
  for (const item of arrayLike) {
    array.push(item);
  }
  return array
}
/**
 *  转义 Xhtml
 * @param props String
 * @returns 
 */
export const escapeXhtml = (props: string) => props.replace(/#/g, '%23').replace(/\n/g, '%0A');
/**
 *  处理stylePropertyValue带px
 * @param node HTMLElement
 * @param styleProperty  string
 * @return number
 */
export const px = (node: HTMLElement, styleProperty: string) => {
  const val = window.getComputedStyle(node).getPropertyValue(styleProperty)
  return parseFloat(val.replace('px', ''))
}
export const width = (node: HTMLElement) => {
  const leftBorder = px(node, 'border-left-width');
  const rightBorder = px(node, 'border-right-width');
  return node.scrollWidth + leftBorder + rightBorder;
}

export const height = (node: HTMLElement) => {
  const topBorder = px(node, 'border-top-width');
  const bottomBorder = px(node, 'border-bottom-width');
  return node.scrollHeight + topBorder + bottomBorder;
}

export const dataAsBase64Url = (content: string, type: FILE_ENUM_TYPE) => `data:${type};base64,${content}`

/**
 * 解析URL扩展
 * @param url string
 */
export const parseExtension = (url: string) => {
  const match = /\.([^\.\/]*?)$/g.exec(url);
  return match ? match[1] : ''
}

/**
 * 返回文件的类型
 * @param url string  文件 URL
 * @returns  string
 */
export const ParsefileType = (url) => {
  const extension = parseExtension(url).toLocaleUpperCase()
  return FILE_ENUM_TYPE[extension] || ''
}

/**
 * 创建 img
 * @param url img url base64 or  url
 * @returns img promise
 */
export const createImage = (url) => {
  if (url === 'data:,') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 处理跨域图片，注意：IOS 不支持该属性
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve(img);
    }
    img.onerror = reject
    img.src = url;
  })
}

/**
 * 克隆元素样式
 * @param sourceNode 
 * @param cloneNode 
 */
const cloneStyle = (sourceNode, cloneNode) => {
  if (sourceNode.cssText) {
    cloneNode.cssText = sourceNode.cssText
  } else {
    // copyProperties
    for (const key of sourceNode) {
      if (sourceNode.getPropertyValue(key)) {
        cloneNode.setProperty(key,
          cloneNode.getPropertyValue(key),
          cloneNode.getPropertyPriority(key)
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
    .then(makeNodeCopy)
    .then(function (clone) {
      return cloneChildren(node, clone, filter);
    })
    .then(function (clone) {
      return processClone(node, clone);
    });

  function makeNodeCopy(node) {
    if (node instanceof HTMLCanvasElement)
      return createImage(node.toDataURL());
    return node.cloneNode(false);
  }

  function cloneChildren(original, clone, filter) {
    var children = original.childNodes;
    if (children.length === 0) return Promise.resolve(clone);

    return cloneChildrenInOrder(clone, asArray(children), filter).then(
      function () {
        return clone;
      }
    );

    function cloneChildrenInOrder(parent, children, filter) {
      var done = Promise.resolve();
      children.forEach((child) => {
        done = done
          .then((): any => cloneNode(child, filter))
          .then((childClone: any) => {
            if (childClone) parent.appendChild(childClone);
          });
      });
      return done;
    }
  }

  /**
     * 克隆
     * @param {HTMLElement} original  原对象
     * @param {HTMLElement} clone  克隆对象
     */
  function processClone(original: HTMLElement, clone: HTMLElement) {
    if (!(clone instanceof Element)) return clone;

    return Promise.resolve()
      .then(() => cloneStyle(
        window.getComputedStyle(original), clone.style))
      .then(clonePseudoElements)
      .then(copyUserInput)
      .then(fixSvg)
      .then(function () {
        return clone;
      });


    function clonePseudoElements() {
      [':before', ':after'].forEach(function (element) {
        clonePseudoElement(element);
      });

      function clonePseudoElement(element) {
        var style = window.getComputedStyle(original, element);
        var content = style.getPropertyValue('content');

        if (content === '' || content === 'none') return;

        var className = uid();
        clone.className = clone.className + ' ' + className;
        var styleElement = document.createElement('style');
        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
        clone.appendChild(styleElement);

        function formatPseudoElementStyle(className, element, style) {
          var selector = '.' + className + ':' + element;
          var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
          return document.createTextNode(selector + '{' + cssText + '}');
          function formatCssText(style) {
            var content = style.getPropertyValue('content');
            return style.cssText + ' content: ' + content + ';';
          }
          function formatCssProperties(style) {
            return asArray(style)
              .map(formatProperty)
              .join('; ') + ';';
            function formatProperty(name) {
              return name + ': ' +
                style.getPropertyValue(name) +
                (style.getPropertyPriority(name) ? ' !important' : '');
            }
          }
        }
      }
    }

    function copyUserInput() {
      if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
      if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
    }

    function fixSvg() {
      if (!(clone instanceof SVGElement)) return;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      if (!(clone instanceof SVGRectElement)) return;
      ['width', 'height'].forEach(function (attribute) {
        var value = clone.getAttribute(attribute);
        if (!value) return;

        clone.style.setProperty(attribute, value);
      });
    }
  }
}