export default function createImg(domtoimage, type) {
  domtoimage[type]()
    .then(function (dataUrl) {
      if (type === 'toCanvas') {
        document.body.appendChild(dataUrl)
      } else if (type === 'toSvg') {
        const svg = dataUrl
          .replace('data:image/svg+xml;charset=utf-8,', '')
          .replace(/\%0A/g, '')
        document.body.appendChild(createDocumentFragment(svg))
      } else {
        if (type === 'toBlob') {
          dataUrl = URL.createObjectURL(dataUrl)
        }
        const img = new Image()
        img.src = dataUrl
        document.body.appendChild(img)
        document.body.appendChild(document.createElement('br'))
      }
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error)
    })
}

function createDocumentFragment(txt) {
  const template = `<div class='child'>${txt}</div>`
  let frag = document.createRange().createContextualFragment(template)
  return frag
}
