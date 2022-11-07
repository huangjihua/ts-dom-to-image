import * as util from './utils'
/**
 * 生成 SVG，base64
 * @param {Object} node
 * @param {Object} width
 * @param {Object} height
 */
export const createSvgEncodeUrl = (
  node: HTMLElement,
  width: number,
  height: number,
  isReturnSvgELement: boolean,
) => {
  const xmlHTML = new XMLSerializer().serializeToString(node)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject x="0" y="0" width="100%" height="100%">
        ${isReturnSvgELement ? xmlHTML : util.escapeXhtml(xmlHTML)}
      </foreignObject>
    </svg>`
  if (isReturnSvgELement) {
    const svgEle = document.createRange().createContextualFragment(svg)
      .childNodes[0]
    console.log(svgEle)
    return svgEle
  }
  const dataURL = `data:image/svg+xml;charset=utf-8,${svg}`
  return dataURL
}
