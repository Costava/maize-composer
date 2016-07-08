module.exports = {
  entry: './src/scripts/main.js',
  output: {
    path: './dist/scripts/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
