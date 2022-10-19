import * as util from './utils'
import { cloneNode } from './cloneNode'
import { processFonts } from './process-font'
import { createImage, checkElementImgToInline } from './process-image'
import { createSvgEncodeUrl } from './createSvg'
import { FILE_ENUM_TYPE, DOM_TO_IMAGE_OPTIONS } from './utils/type'

export default class DomToImage {
  public options
  /**
   * constructor
   * @param props 渲染参数
   */
  constructor(options: DOM_TO_IMAGE_OPTIONS) {
    const defaultValue = {
      quality: 1,
      cacheBust: false,
      proxy: null,
      useCORS: false,
      httpTimeout: 30000,
      scale: window.devicePixelRatio,
    }
    this.options = { ...defaultValue, ...options }
  }
  toSvg() {
    return this.inlineBase64Svg()
  }
  toPng() {
    return this.drawCanvas().then((canvas) =>
      canvas.toDataURL(FILE_ENUM_TYPE.PNG, this.options.quality),
    )
  }

  toJpg() {
    return this.drawCanvas().then((canvas) =>
      canvas.toDataURL(FILE_ENUM_TYPE.JPG, this.options.quality),
    )
  }

  toCanvas() {
    return this.drawCanvas().then((canvas) => canvas)
  }

  toBlob() {
    return this.drawCanvas().then((canvas) => {
      if (canvas.toBlob)
        return new Promise(function (resolve) {
          canvas.toBlob(resolve)
        })
      return util.toBlob(canvas)
    })
  }

  toPixelData() {
    return this.drawCanvas().then((canvas) => {
      return canvas
        .getContext('2d')
        ?.getImageData(
          0,
          0,
          util.width(this.options.targetNode),
          util.height(this.options.targetNode),
        ).data
    })
  }

  private async drawCanvas() {
    const svg = await this.inlineBase64Svg()
    const image: any = await createImage.call(this, svg)
    const canvas = this.creatCanvas()
    const context = canvas.getContext('2d')
    if (context) context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return Promise.resolve(canvas)
  }

  /**
   * create base64 svg
   *
   * @private
   * @returns {string}
   * @memberof DomToImage
   */
  private inlineBase64Svg() {
    return Promise.resolve()
      .then((): any => cloneNode.call(this, this.options.targetNode, true))
      .then(processFonts.bind(this))
      .then(checkElementImgToInline.bind(this)) // 图片和背景图转内联形式
      .then(this.applyOptions.bind(this))
      .then((clone) => {
        clone.setAttribute('style', '')
        return createSvgEncodeUrl(
          clone,
          this.options.width || util.width(this.options.targetNode),
          this.options.height || util.height(this.options.targetNode),
        )
      })
  }
  /**
   * 传入的样式属性赋值到克隆元素
   * @param {HTMLElement} clone
   * @returns
   */
  private applyOptions(clone: HTMLElement) {
    if (this.options.bgColor) clone.style.backgroundColor = this.options.bgColor
    if (this.options.width) clone.style.width = this.options.width + 'px'
    if (this.options.height) clone.style.height = this.options.height + 'px'
    const styles = this.options.style
    for (const style in styles) {
      clone.style[style] = styles[style]
    }
    return clone
  }

  private creatCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width =
      (this.options.width || util.width(this.options.targetNode)) *
      this.options.scale
    canvas.height =
      (this.options.height || util.height(this.options.targetNode)) *
      this.options.scale
    if (this.options.bgColor) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = this.options.bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    return canvas
  }
}
