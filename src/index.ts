import * as util from './utils/tool';

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

class DomToImage {
  public options;
  /**
   * constructor
   * @param props 渲染参数
   */
  constructor(options: RenderOptions) {
    this.options = options;
  }

  toSvg() {
    return Promise.resolve()
  }

  toPng() {

  }

  toJpg() {

  }

  toCanvas() {

  }

  toBlob() {

  }

  toPixelData() {

  }

  private drawCanvas() {

  }
}