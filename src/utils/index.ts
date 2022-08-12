
import { xhr } from './xhr';

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
export const ImgToBase64Encode = (props: {
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

