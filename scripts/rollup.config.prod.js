import baseConfig from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    filesize(),
    terser({
      compress: {
        pure_funcs: ['console.log', 'alert'], // 去掉console.log函数
      },
    }),
  ],
}
