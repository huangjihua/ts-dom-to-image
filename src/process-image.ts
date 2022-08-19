import * as util from './utils';
import { xhr } from './utils/xhr';

/**
 * 创建image
 * @param url img url base64 or  url
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = (url: string): Promise<any> => {
  if (url === 'data:,') return Promise.resolve(null)
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
export const readUrlFileToEncode = (props: {
  url: string,
  httpTimeout?: number,
  cacheBust?: boolean,
  useCredentials?: boolean,
  imagePlaceholder?: string  // base64
}): Promise<any> => xhr({
  ...props, successHandle: (request: { response: Blob; }, resolve: (arg0: string | ArrayBuffer | null) => void) => {
    const encoder = new FileReader();
    // 该事件在读取操作结束时（
    encoder.onloadend = function () {
      let content = encoder.result;
      if (content && typeof content === 'string') content = content.split(/,/)[1]
      resolve(content);
    };
    // 开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL 格式的 Base64 字符串以表示所读取文件的内容。
    encoder.readAsDataURL(request.response);
  }
})

/**
 *  检测图片元素和样式内的背景图，并转换为内联的 Base64形式
 * @param node HTMLELment
 */
export const checkElementImgToInline = async (node: HTMLElement) => {
  if (node instanceof HTMLImageElement) return imgSrcToInlineBase64(node);
  if (node.style) {
    const background = node.style.getPropertyValue('background');
    if (!background) return node;
    const value = await checkStrUrlFile(background);
    if (value) node.style.setProperty('background', value, node.style.getPropertyPriority('background'));
  }
  await Promise.all(
    util.asArray(node.childNodes).map((child: HTMLElement) => {
      return checkElementImgToInline(child);
    }))
  return node;
}

/**
 * 图片src地址转换成Base64并重新赋值给图片
 * @param {HTMLImageElement} element 
 * @returns {Promise<string>}
 */
function imgSrcToInlineBase64(element: HTMLImageElement): Promise<any> {
  if (util.isDataUrl(element.src)) return Promise.resolve();
  return Promise.resolve(element.src)
    .then((url) => readUrlFileToEncode({ url: url }))
    .then((data) => util.dataAsBase64Url(data, util.ParsefileType(element.src)))
    .then((dataUrl) => {
      return new Promise(function (resolve, reject) {
        element.onload = resolve;
        element.onerror = reject;
        element.src = dataUrl;
      });
    });
}

/**
 * 检测字符内所有的url File,并转成内联的 base64地址
 * @param {string} str 
 * @param {string} baseUrl 
 * @returns {Promise<string>}
 */
function checkStrUrlFile(str: string, baseUrl?: string) {
  if (!util.checkStrUrl(str)) return Promise.resolve(str);;
  console.log(str, baseUrl);
  const urls = util.readUrls(str);
  let done = Promise.resolve(str);
  urls.forEach((url: string) => {
    done = done.then(async str => {
      url = baseUrl ? createLinkUrl(url, baseUrl) : url;
      const imgData: string = await readUrlFileToEncode({ url: url })
      const base64 = util.dataAsBase64Url(imgData, util.ParsefileType(url));
      return str.replace(util.urlAsRegex(url), '$1' + base64 + '$3');
    })
    return done
  })
  return done;
}