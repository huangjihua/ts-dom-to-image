import * as util from './utils';
import { cloneNode } from './cloneNode';
import { embedFonts } from './embedFonts';
import { createImage, inlineImages } from './operateImage';
import { createSvgEncodeUrl } from './createSvg';
import { FILE_ENUM_TYPE } from './utils/type';
interface RenderOptions {
  targetNode: HTMLElement; // 目标node
  width?: number; // 呈现前应用于节点的宽(以像素为单位)
  height?: number; // 呈现前应用于节点的高(以像素为单位)
  bgColor?: string; // 背景色色值
  style?: CSSStyleDeclaration; // css对象集合
  filter?: Function; // 一个以 DOM 节点为参数的函数，如传入节点要包含在输出中则返回 true （排除节点同时也包含子节点），不能是根节点
  quality?: number; // 一个介于0和1之间的数字，表示 JPEG 图像的图像质量(例如0.92 = > 92%)
  imagePlaceholder?: string; // 占位符图像的数据 URL，在获取图像失败时将使用该 URL。默认值为未定义，并将对失败的映像抛出错误
  cacheBust?: boolean; // 设置为 true 可将当前时间作为查询字符串追加到 URL 请求以启用缓存崩溃
  useCredentials?: boolean;  // 对外部 URI（CORS 请求）使用（现有）身份验证凭据
  httpTimeout?: number; // 设置 resolve 超时时间，单位单位秒
  scale?: number; // 自定义图像缩放比例,用于保障图像质量
}


export default class DomToImage {
  public options;
  /**
   * constructor
   * @param props 渲染参数
   */
  constructor(options: RenderOptions) {
    const defaultValue = { quality: 1, cacheBust: false, useCredentials: false, httpTimeout: 30000, scale: window.devicePixelRatio }
    this.options = { ...defaultValue, ...options };
  }

  toSvg() {
    return Promise.resolve()
      .then((): any => cloneNode(this.options.targetNode, this.options.filter, true))
      // .then(embedFonts)
      .then(inlineImages)
      .then(this.applyOptions.bind(this))
      .then(clone => {
        clone.setAttribute('style', '')
        return createSvgEncodeUrl(clone,
          this.options.width || util.width(this.options.targetNode),
          this.options.height || util.height(this.options.targetNode)
        );
      })
  }

  toPng() {
    return this.drawCanvas()
      .then(canvas => canvas.toDataURL(FILE_ENUM_TYPE.PNG, this.options.quality));
  }

  toJpg() {
    return this.drawCanvas()
      .then(canvas => canvas.toDataURL(FILE_ENUM_TYPE.JPG, this.options.quality));
  }

  toCanvas() {
    return this.drawCanvas()
      .then(canvas => canvas);
  }

  toBlob() {
    return this.drawCanvas()
      .then((canvas) => {
        if (canvas.toBlob)
          return new Promise(function (resolve) {
            canvas.toBlob(resolve);
          });
        return util.toBlob(canvas);
      });
  }

  toPixelData() {
    return this.drawCanvas()
      .then(canvas => {
        return canvas.getContext('2d')?.getImageData(0, 0, util.width(this.options.targetNode), util.height(this.options.targetNode)).data;
      });
  }

  private drawCanvas() {
    return this.toSvg()
      .then(createImage)
      .then(util.delay(100))
      .then((image: any) => {
        const canvas = this.creatCanvas();
        const context = canvas.getContext('2d')
        if (context) context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
      })
  }

  private applyOptions(clone: HTMLElement) {
    if (this.options.bgColor) clone.style.backgroundColor = this.options.bgColor;
    if (this.options.width) clone.style.width = this.options.width + 'px';
    if (this.options.height) clone.style.height = this.options.height + 'px';
    const styles = this.options.style
    for (const style in styles) {
      clone.style[style] = styles[style];
    }
    return clone;
  }
  private creatCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = (this.options.width || util.width(this.options.targetNode)) * this.options.scale;
    canvas.height = (this.options.height || util.height(this.options.targetNode)) * this.options.scale;
    if (this.options.bgColor) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = this.options.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    return canvas;
  }
}