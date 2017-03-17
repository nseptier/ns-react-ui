import path from 'path';
import webpack from 'webpack';

module.exports = {
  entry: {
    index: './src/index.jsx',
  },

  output: {
    filename: '[name].js',
    library: 'reactList',
    libraryTarget: 'umd',
    path: path.join(__dirname, '/dist'),
  },

  target: 'node',

  module: {
    rules: [
      {
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          failOnWarning: false,
          failOnError: true,
        },
        test: /\.jsx?$/,
      },
      {
        exclude: /node_modules/,
        test: /\.jsx?$/,
        use: ['babel-loader'],
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.join(__dirname, '/src/stylesheets')],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.HashedModuleIdsPlugin(),

    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
    }),

    new webpack.optimize.AggressiveMergingPlugin(),

    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      mangle: {
        keep_fnames: true,
        screw_ie8: true,
      },
      sourceMap: true,
    }),
  ],

  resolve: {
    alias: {
      components: path.join(__dirname, '/src/components'),
      stylesheets: path.join(__dirname, '/src/stylesheets'),
      utils: path.join(__dirname, '/src/utils'),
    },
    extensions: [
      '.js',
      '.jsx',
      '/index.js',
    ],
  },
};
