const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: ['./src/gl-plotter.ts'],
  output: {
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/lib/',
    filename: 'gl-plotter.js',
    asyncChunks: false,
    library: {
      type: 'umd',
    },
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'script-loader',
        },
      },
      {
        test: /\.(glsl)$/,
        use: [
          {
            loader: 'glsl-shader-loader',
            options: {},
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({})],
  },
  devServer: {
    static: {
      directory: __dirname,
      watch: true,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  mode: 'development'
};
