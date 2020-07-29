const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: [path.join(process.cwd(), 'sdk.js')],
  output: {
      filename: 'sdk.min.js',
      path: process.cwd()
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
