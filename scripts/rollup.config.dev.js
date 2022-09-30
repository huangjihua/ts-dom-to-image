import baseConfig from './rollup.config.base'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    serve({
      port: 6060,
      contentBase: ['dist', 'demo'],
      openPage: 'index.html',
    }),
    livereload({
      watch: 'demo',
    }),
  ],
}
