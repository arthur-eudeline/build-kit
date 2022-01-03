import {WebpackConfiguration, WebpackModuleRule} from "../../@types/webpack";
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

export const defaultJavaScriptConfig:WebpackModuleRule = {
  name: 'JavaScript',
  test: /\.(ts)|(js)$/,
  use: [
    {
      loader: "babel-loader",
    },
  ],
  exclude: /node_modules/,
};

export const defaultCSSConfig:WebpackModuleRule = {
  name: 'CSS',
  test: /\.(css|sass|scss)$/i,
  use: [
    'style-loader',
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        esModule: false,
      }
    },
    {
      loader: 'css-loader',
      options: {
        // url: false,
        esModule: false,
      },
    },
    {
      loader: 'postcss-loader',
    },
    'sass-loader',
  ],
};

export const defaultFontConfig:WebpackModuleRule = {
  name: 'Font',
  test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
  type: "asset/resource", // Prevents to inline fonts
  // Put fonts into fonts/ sub-directory
  generator: {
    filename: "fonts/[name].[contenthash][ext]"
  }
};

export const defaultIconsConfig:WebpackModuleRule = {
  name: 'Icons',
  test: /\.(svg)?$/,
  type: "asset/resource", // Prevents to inline fonts
  // Put fonts icons icons/ sub-directory
  generator: {
    filename: "icons/[name].[contenthash][ext]"
  },
};

export const defaultImagesConfig:WebpackModuleRule = {
  name: 'Images',
  test: /\.(jpg|png)?$/,
  type: "asset/resource", // Prevents to inline fonts
  // Put fonts images img/ sub-directory
  generator: {
    filename: "img/[name].[contenthash][ext]"
  }
};

const defaultConfig:WebpackConfiguration = {
  // Webpack log config
  stats: {
    assets: true,
    moduleAssets: true,
    version: true,
    errorStack: true,
    performance: true,
    errorDetails: true,
    loggingTrace: false,
    builtAt: true,
    cachedModules: true,
    cachedAssets: true,
    colors: true,
    timings: true,
    outputPath: true,
    modules: false,
  },
  
  // Webpack cache system --> reduce build times
  // cache: process.env.NODE_ENV !== 'production' ? {
  //   type: "filesystem",
  //   allowCollectingMemory: true
  // } : false,
  
  // Webpack rules
  module: {
    rules: []
  },
  
  // Plugins
  plugins: [],
  
  // Needed to tell webpack to consider these files
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx']
  },
  
  // Entry files
  entry: {},
  
  // Output configuration
  output: {
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    chunkFilename: "[id].[contenthash].chunk.min.js",
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    filename: "[name].[contenthash].min.js",
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    assetModuleFilename: "[name].[contenthash].asset.min[ext]",
  },
};

export default defaultConfig;