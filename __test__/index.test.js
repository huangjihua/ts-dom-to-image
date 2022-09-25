import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import 'jest-axe/extend-expect'

// import DomToImage from '../src/index' //TODO jest 针对es6 import的支持问题

function demoDOM() {
  const style = document.createElement('style')
  style.innerText = `	
  .c-m-box{
    width: 600px;
  }
  .c-m-img{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border:solid 1px gray;
  }
  .outline {
      outline: 2px solid red;
      outline-offset: -2px;
  }
  .c-m-list{
    width: 600px;
    height: 250px;
    /* background-color: aliceblue; */
  }`
  document.head.appendChild(style)
  document.body.innerHTML = `
    <div id="cmBox" class="c-m-box">
      <div class="c-m-list">
        <div class="img-list">
          <img src="../demo/img/2.png" alt="" class="c-m-img" />
          <div class="img2"></div>
          <img
            style="width:200px;height:150px; border:1px solid pink"
            src="https://m1.autoimg.cn/newsdfs/g26/M04/6A/D9/516x264_autohomecar__ChwFkGFmq8OAAmCSAAaQ44fMmNY598.png.webp"
            alt=""
            crossOrigin="anonymous"
          />
        </div>
      </div>
      <div class="btn-list">
        <button class="button-svg">生成SVG图片</button>
        <button class="button-jpg">生成JPG图片</button>
        <button class="button-png">生成PNG图片</button>
        <button class="button-canvas">生成canvas展示</button>
        <button class="button-blob">生成toBlob图片</button>
      </div>
    </div>`
  const node = document.querySelector('.c-m-list')
  const DomToImage = require('../dist/es/dom-to-image')
  // window.getComputedStyle = (elt, pseudoElt) => {
  //   window.getComputedStyle(elt)
  // } //  RangeError: Maximum call stack size exceeded
  const dti = new DomToImage({
    targetNode: node,
    bgColor: '#fff',
    scale: window.devicePixelRatio,
  })
  const createImg = require('./create-image')
  const btn_svg = document.querySelector('.button-svg')
  btn_svg.addEventListener('click', () => {
    createImg(dti, 'toSvg')
    console.log('生成svg', dti['toSvg'])
  })

  return document
}
test('loads and display html', () => {
  const document = demoDOM()
  document.querySelector('.button-svg').click()
  expect(document.getElementsByTagName('svg'))
})
