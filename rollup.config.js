import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [
  // UMD for brower-friendly build
  {
    input: 'src/index.ts', //entry
    output: {
      name: 'dom-to-image', //  umd 必填
      file: pkg.brower, // 终打包出来的文件路径和文件名，这里是在package.json的browser: 'dist/index.js'字段中配置的
      format: 'umd', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
    },
    plugins: [
      resolve(), // 查找和打包 node_moudles 中的第三方模块
      commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
      typescript(), //解析 typescirpt
    ],
  },
  {
    input: 'src/index.ts',
    external: ['ms'],
    plugins: [typescript()],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'auto' },
      { file: pkg.module, format: 'es', exports: 'auto' },
    ],
  },
];
