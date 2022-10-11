import resolve from 'rollup-plugin-node-resolve' //帮助 Rollup 查找外部模块，然后导入
import commonjs from 'rollup-plugin-commonjs' //将CommonJS模块转换为 ES2015 供 Rollup 处理
import typescript from 'rollup-plugin-typescript'
import { terser } from 'rollup-plugin-terser' // 压缩js代码，包括es6代码压缩
import babel from '@rollup/plugin-babel' //让我们可以使用es6新特性来编写代码
import eslint from '@rollup/plugin-eslint' // js代码检测
import clear from 'rollup-plugin-clear'
import pkg from '../package.json'

const pkgName = 'dom-to-image'
const _name = 'DomToImage'
// 打包处理的问题，添加备注信息
const banner =
  '/*!\n' +
  ` * ${pkg.name} v${pkg.version}\n` +
  ` * (c) 2022-${new Date().getFullYear()} ${pkg.author}\n` +
  ' * Released under the MIT License.\n' +
  ' */'
// eslint-disable-next-line no-undef
const isProd = process.env.NODE_ENV === 'production'
export default // UMD for brower-friendly build
{
  input: 'src/index.ts', //entry
  output: [
    {
      name: _name, //  umd 必填
      file: `dist/umd/${pkgName}.js`, // 终打包出来的文件路径和文件名，这里是在package.json的browser: 'dist/index.js'字段中配置的
      format: 'umd', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
      banner,
    },
    {
      name: _name,
      file: `dist/umd/${pkgName}.min.js`,
      format: 'umd',
      banner,
      plugins: [terser()],
    },
    {
      file: `dist/cjs/${pkgName}.js`,
      format: 'cjs',
      exports: 'auto',
      banner,
      // sourcemap: isProd ? false: true
    },
    {
      file: `dist/es/${pkgName}.js`,
      format: 'es',
      exports: 'auto',
      banner,
      // sourcemap: isProd ? false: true
    },
  ],
  // 注意 plugin 的使用顺序
  plugins: [
    clear({
      targets: ['dist'],
    }),
    typescript(), //解析 typescirpt
    resolve(), // 查找和打包 node_moudles 中的第三方模块
    commonjs({
      include: 'node_modules/**',
    }), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    eslint({
      throwOnError: true, // 抛出异常并阻止打包
      include: ['src/**'],
      exclude: ['node_modules/**'],
    }),
    babel({
      babelHelpers: 'bundled', // 如果用rollup构建一个项目的用此参数
      exclude: 'node_modules/**', // 不转换那些模块=>只编译我们的源代码
    }),
  ],
}
