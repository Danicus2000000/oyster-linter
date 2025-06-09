import * as path from "path";
import * as webpack from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

module.exports = {
  target: "node",
  mode: "production",
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    vscode: "commonjs vscode",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  devtool: "source-map",
};
