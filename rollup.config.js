import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const production = process.env.BUILD === 'true';

const plugins = [
  typescript(), //解析 typescirpt
  resolve(), // 查找和打包 node_moudles 中的第三方模块
  commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
  production && terser({
    // output: {
    //   ascii_only: true, // 仅输出ascii字符
    // },
    compress: {
      pure_funcs: ['console.log'], // 去掉console.log函数
    },
  }),
];

export default [
  // UMD for brower-friendly build
  {
    input: 'src/index.ts', //entry
    output: [
      {
        name: 'dom-to-image', //  umd 必填
        file: pkg.brower, // 终打包出来的文件路径和文件名，这里是在package.json的browser: 'dist/index.js'字段中配置的
        format: 'umd', // umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
        sourcemap: true,
      },
    ],
    plugins: plugins,
  },
  {
    input: 'src/index.ts',
    external: ['ms'],
    plugins: [
     typescript(),
     production && terser({
        compress: {
          pure_funcs: ['console.log', 'alert'], // 去掉console.log函数
        },
      }),
    ],
    output: [
      { file: pkg.module, format: 'cjs', exports: 'auto', sourcemap: true },
      { file: pkg.main, format: 'es', exports: 'auto', sourcemap: true },
    ],
  },
];
