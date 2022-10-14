export default function createImg(domtoimage: any, type: string) {
  domtoimage[type]()
    .then(function (dataUrl: string | HTMLElement) {
      if (type === 'toCanvas') {
        document.body.appendChild(dataUrl as HTMLElement)
      } else if (type === 'toSvg') {
        const svg = (dataUrl as string)
          .replace('data:image/svg+xml;charset=utf-8,', '')
          .replace(/\%0A/g, '')
        document.body.appendChild(createDocumentFragment(svg))
      } else {
        if (type === 'toBlob') {
          dataUrl = URL.createObjectURL(dataUrl as any)
        }
        const img: HTMLImageElement = new Image()
        img.setAttribute('src', dataUrl as string)
        document.body.appendChild(img)
        document.body.appendChild(document.createElement('br'))
      }
    })
    .catch(function (error: Error) {
      console.error('oops, something went wrong!', error)
    })
}

function createDocumentFragment(txt: string): DocumentFragment {
  const template = `<div class='child'>${txt}</div>`
  let frag = document.createRange().createContextualFragment(template)
  return frag
}