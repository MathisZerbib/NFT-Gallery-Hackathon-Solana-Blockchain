var path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "js/main.js"
  },
  devServer: {
    contentBase: path.resolve(__dirname, "./dist"),
    historyApiFallback: true,
    inline: true,
    open: true,
    hot: true,
		disableHostCheck: true,
    port: process.env.PORT || 8081
  },
  mode: 'development',
  devtool: "eval-source-map"
};
