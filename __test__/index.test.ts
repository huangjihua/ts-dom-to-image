import DomToImage from '../src/index'
import * as processImage from '../src/process-image'
import * as processStyle from '../src/process-style'
import createImg from './method'

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
  const node = document.querySelector('.c-m-list') as HTMLElement

  const dti = new DomToImage({
    targetNode: node,
    bgColor: '#fff',
    scale: window.devicePixelRatio,
  })
  const btn_svg = document.querySelector('.button-svg') as HTMLElement
  btn_svg.addEventListener('click', () => {
    createImg(dti, 'toSvg')
    console.log('生成svg', dti['toSvg'])
  })

  return document
}
describe('测试生成不同类型图片', () => {
  const document = demoDOM()
  test('DOM生成 SVG', () => {
    // const btn_svg = document.querySelector('.button-svg') as HTMLElement
    // btn_svg.click()
    // expect(document.getElementsByTagName('svg'))
  })
  test('检测图片元素和样式内的背景图，并转换为内联的 Base64形式', () => {
    processImage.checkElementImgToInline(document.querySelector('.c-m-list') as HTMLElement)
  })
})
