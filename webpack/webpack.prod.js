const { readdirSync, existsSync } = require('fs')
const { resolve } = require('path')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

const useParentFolder = existsSync('../templates');

const templateFiles = readdirSync(useParentFolder ? resolve('..', 'templates') : resolve('emails', 'templates')).filter(folder => /.hbs$/gi.test(folder));
const partialsFiles = readdirSync(useParentFolder ? resolve('..', 'templates', 'partials') : resolve('emails', 'templates', 'partials')).filter(folder => /.hbs$/gi.test(folder));

module.exports = merge(common, {
  output: {
    path: useParentFolder ? resolve('..', 'dist') : resolve('emails', 'dist'),
  },
  mode: 'production',
  stats: 'errors-only',

  plugins: [
    new CleanWebpackPlugin(),
    new HTMLInlineCSSWebpackPlugin(),
    ...templateFiles.map(file => {
      return new HtmlWebpackPlugin({
        filename: file,
        template: useParentFolder ? `../templates/${file}` : `emails/templates/${file}`,
        inject: false,
        minify: false
      })
    }),
    ...partialsFiles.map(partial => {
      return new HtmlWebpackPartialsPlugin({
        path: useParentFolder ? `../templates/partials/${partial}` : `emails/templates/partials/${partial}`,
        location: partial.replace(/.hbs/gi, ''),
        priority: 'replace',
        template_filename: [...templateFiles]
      })
    }),
  ],
})