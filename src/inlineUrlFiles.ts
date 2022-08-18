import * as util from './utils';
import { imgToEncode, createLinkUrl } from "./operateImage";

/**
 * 处理所有资源文件
 * @param str 
 * @param baseUrl 
 * @returns 
 */
export const inlineFileAll = (str: string, baseUrl?: any) => {
  if (!util.checkStrUrl(str)) return Promise.resolve(str);
  console.log(str, baseUrl);
  const urls = util.readUrls(str);
  let done = Promise.resolve(str);
  /**
   * 
   * @param str 
   * @param url 
   * @param baseUrl 
   * @returns 
   */
  const inline = async (str: string, url: string, baseUrl: string) => {
    url = baseUrl ? createLinkUrl(url, baseUrl) : url;
    let result = ''
    const imgData: string = await imgToEncode({ url: url })
    const base64 = util.dataAsBase64Url(imgData, util.ParsefileType(url));
    result = str.replace(util.urlAsRegex(url), '$1' + base64 + '$3');
    return result;
  }
  urls.forEach((url: string) => {
    done = done.then((str: string) => {
      return inline(str, url, baseUrl);
    });
  });
  return done;
}