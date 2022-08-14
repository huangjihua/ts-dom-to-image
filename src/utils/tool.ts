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

export const createLinkUrl = (url: string, baseUrl: string): string => {
  var doc = document.implementation.createHTMLDocument();
  var base = doc.createElement('base');
  doc.head.appendChild(base);
  var a = doc.createElement('a');
  doc.body.appendChild(a);
  base.href = baseUrl;
  a.href = url;
  console.log(url);
  return a.href;
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

      function clonePseudoElement(element) {
        const style = window.getComputedStyle(original, element);
        const content = style.getPropertyValue('content');
        if (content === '' || content === 'none') return;
        const className = uid();
        clone.className = clone.className + ' ' + className;
        const styleElement = document.createElement('style');
        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
        clone.appendChild(styleElement);

        function formatPseudoElementStyle(className, element, style) {
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