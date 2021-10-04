const { resolve } = require('path');
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',

  devServer: {
    hot: 'only',
    open: true,
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new StylelintPlugin({
      fix: true,
    })
  ]
})