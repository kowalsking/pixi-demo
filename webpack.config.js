const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  devtool: "inline-source-map",
  devServer: {
    port: 3001,
    contentBase: path.join(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  mode: "development",

  plugins: [
    new CopyWebpackPlugin([
      {
        from: "src/",
        to: "assets",
      },
    ]),
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
};
