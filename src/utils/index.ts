
import { xhr } from './xhr';
import { FILE_ENUM_TYPE } from "./type";

export const checkBrowse = () => {
  const ua = navigator.userAgent
  return {
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(ua),
    isIos:/(iPhone|iPad|iPod|iOS)/i.test(ua)
  }
}
export const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
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
  return (args: unknown) => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args)
    }, delayTime)
  })
}
export const uid = () => {
  let index = 0;
  /* see http://stackoverflow.com/a/6248722/2519373 */
  const fourNumberRandom = `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4)
  return `u0000${fourNumberRandom}${index++}`
}
/**
 * 数组化
 * @param arrayLike 
 * @returns array
 */
export const asArray = (arrayLike: any) => {
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
 * 判断字符串是否已 data:开头
 * @param url 
 * @returns {boolean}
 */
export const isDataUrl = (url: string) => {
  return url.search(/^(data:)/) !== -1;
}

/**
 * URL正则
 * @param url 
 * @returns {RegExpConstructor}
 */
export const urlAsRegex = (url: string) => {
  return new RegExp('(url\\([\'"]?)(' + escape(url) + ')([\'"]?\\))', 'g');
}

/**
 * 检查字符串内是否存在 URL 文件资源
 * @param str 
 * @returns 
 */
export const checkStrUrl = (str: string) => str.search(URL_REGEX) !== -1

/**
 * 读取字符并解析出其中 URL
 * @param string 
 * @returns {Array}
 */
export const readUrls = (string: string) => {
  const result: any = [];
  let match;
  while ((match = URL_REGEX.exec(string)) !== null) {
    result.push(match[1]);
  }
  return result.filter(function (url: string) {
    return !isDataUrl(url);
  });
}

/**
 * 返回文件的类型
 * @param url string  文件 URL
 * @returns  string
 */
export const ParsefileType = (url: string) => {
  const extension = parseExtension(url).toLocaleUpperCase()
  return FILE_ENUM_TYPE[extension] || ''
}

/**
 * canvas转Blob
 * @param canvas 
 * @returns 
 */
export const toBlob = (canvas: HTMLCanvasElement) => {
  return new Promise(resolve => {
    const binaryString = window.atob(canvas?.toDataURL().split(',')[1]);
    const length = binaryString.length;
    const binaryArray = new Uint8Array(length);
    for (let i = 0; i < length; i++)
      binaryArray[i] = binaryString.charCodeAt(i);

    resolve(new Blob([binaryArray], {
      type: 'image/png'
    }));
  });
}

/**
 * 生成新的 URL
 * @param url 
 * @param baseUrl 
 * @returns 
 */
export const createLinkUrl = (url: string, baseUrl: string): string => {
  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement('base');
  doc.head.appendChild(base);
  const a = doc.createElement('a');
  doc.body.appendChild(a);
  base.href = baseUrl;
  a.href = url;
  console.log(url);
  return a.href;
}

/**
 * 读取Url 文件并转成Base64字符串
 * @param {Object} props 
@return {Promise}
 */
export const readUrlFileToBase64 = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}): Promise<any> => xhr({
  ...props, successHandle: (request: { response: Blob; }, resolve: (arg0: string | ArrayBuffer | null) => void) => {
    const reader = new FileReader();
    // 该事件在读取操作结束时（
    reader.onloadend = function () {
      let content = reader.result;
      // if (content && typeof content === 'string') content = content.split(/,/)[1]
      resolve(content);
    };
    reader.onerror = (err) => {
      console.error('img url reader fail',err)
    }
    // 开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL 格式的 Base64 字符串以表示所读取文件的内容。
    reader.readAsDataURL(request.response);
  }
})

/**
 * 检测字符内所有的url File,并转成内联的 base64地址
 * @param {string} str 
 * @param {string} baseUrl 
 * @returns {Promise<string>}
 */
export const checkStrUrlFile = (str: string, baseUrl?: string) => {
  if (!checkStrUrl(str)) return Promise.resolve(str);;
  console.log(str, baseUrl);
  const urls =  readUrls(str);
  let done = Promise.resolve(str);
  urls.forEach((url: string) => {
    done = done.then(async str => {
      url = baseUrl ? createLinkUrl(url, baseUrl) : url;
      const content: string = await readUrlFileToBase64({ url: url })
      // console.log(content);
      return str.replace(urlAsRegex(url), '$1' + content + '$3');
    })
  })
  return done;
}