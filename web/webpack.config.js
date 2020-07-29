const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: [path.join(process.cwd(), 'src/sdk.js')],
  output: {
      filename: 'sdk.min.js',
      path: path.join(process.cwd(), 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
