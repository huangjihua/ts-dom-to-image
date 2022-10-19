import proxy from '../proxy';

describe('测试proxy非转发请求方法', () => {
  test('外链图片资源转Base64', () => {
    proxy('https://m1.autoimg.cn/newsdfs/g26/M04/6A/D9/516x264_autohomecar__ChwFkGFmq8OAAmCSAAaQ44fMmNY598.png.webp').then((data) => expect(data).toMatch(/^data:image\/webp;base64/g))
  })
  test('外链字体资源转Base64', () => {
    proxy('https://at.alicdn.com/wf/webfont/QBa4l4xvmwzg/-xLe239h9x-gXbqAqlxsa.woff2').then((data) => expect(data).toMatch(/^data:font\/woff2;base64/g))
  })
})
