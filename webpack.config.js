const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const getMode = () => {
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
};

const getTarget = () => {
  if (process.env.NODE_ENV === "production") {
    return "browserslist";
  }

  return "web";
};

const getPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "static", "index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ];

  if (process.env.SERVE) {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  return plugins;
};

const mode = getMode()

module.exports = {
  mode,
  target: getTarget(),
  plugins: getPlugins(),
  entry: path.resolve(__dirname, "src", "index.tsx"),
  devtool: "source-map",
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src", "Components"),
      "@pages": path.resolve(__dirname, "src", "Pages"),
      "@variables": path.resolve(__dirname, "src", "styles", "variables.scss"),
      "@styles": path.resolve(__dirname, "src", "styles"),
      "@hooks": path.resolve(__dirname, "src", "hooks"),
      "@utils": path.resolve(__dirname, "src", "utils"),
      "@svg": path.resolve(__dirname, "static", "svg"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: mode === "production" ? "asset" : "asset/resource",
      },
    ],
  },
};
