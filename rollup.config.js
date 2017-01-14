import buble from 'rollup-plugin-buble'

export default {
  entry: 'lib/main.js',
  dest: 'build/main.js',
  plugins: [ buble() ],
  format: 'iife',
  moduleName: 'jotbb'
}
