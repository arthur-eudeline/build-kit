import {Configuration} from "webpack";
import {WebpackModuleRule} from "../../@types/webpack";

// const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const webpack = require("webpack");
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
// const AssetsPlugin = require('assets-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const CSSMinimizer = require('css-minimizer-webpack-plugin');

export const defaultJavaScriptConfig:WebpackModuleRule = {
  name: 'JavaScript',
  test: /\.(ts)|(js)$/,
  use: [
    {
      loader: "babel-loader",
    },
  ],
  exclude: "node_modules"
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
  }
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

const defaultConfig:Configuration = {
  // Webpack log config
  stats: {
    assets: true,
    moduleAssets: true,
    version: true,
    errorStack: false,
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
  plugins: [
    // Remove duplicate assets code
    new DuplicatePackageCheckerPlugin(),

    // Reduce Lodash size
    // new LodashModuleReplacementPlugin(),

    // Extract CSS content into different files
    // new MiniCssExtractPlugin({
    //   filename: production
    //     ? "[name].[contenthash].min.css"
    //     : "[name].css",
    // }),

    // Defines a ENV variable
    // new webpack.DefinePlugin({
    //   DEBUG: !production,
    //   PRODUCTION: production,
    // }),

    // Generate an "assets.json" file required by the asset system
    // new AssetsPlugin({
    //   path: path.resolve(__dirname, './src/Assets/dist/'),
    //   filename: 'assets.json',
    //   includeAllFileTypes: true,
    //   entrypoints: true,
    //   removeFullPathAutoPrefix: true,
    //   prettyPrint: true,
    //   includeDynamicImportedAssets: true,
    //   processOutput: (assets) => {
    //     for (const assetKey in assets) {
    //       const asset = assets[assetKey];
    //       for (const assetType in asset) {
    //         const assetsList = assets[assetKey][assetType];
    //
    //         // Converts the assets in array if it is not
    //         if (!Array.isArray(assetsList)) {
    //           assets[assetKey][assetType] = [assetsList];
    //         }
    //       }
    //
    //       // Adds the HotReload client script to the JS assets list if in development mode
    //       if (!production) {
    //         if (!assets[assetKey].js) {
    //           // noinspection JSValidateTypes
    //           assets[assetKey].js = [];
    //         }
    //
    //         // How to add a new JS file
    //         // if (!assets[assetKey].js.includes('test.js')) { // noinspection JSUnresolvedFunction
    //         //   assets[assetKey].js.push('test.js');
    //         // }
    //       }
    //     }
    //
    //     return JSON.stringify(assets, null, 2);
    //   },
    //   // processOutput: this.processOutput(webpackConfig)
    // }),

    // new webpack.IgnorePlugin({
    //   checkResource(resource) {
    //     // return resource.includes('@googlemaps');
    //     return false;
    //   },
    // }),
  ],

  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {"path": false, "os": false, 'fs': false,},
    alias: {
      'lodash-es': 'lodash',
      'lodash.topath': 'lodash/toPath',
      'lodash.toarray': 'toPath\toArray'
    }
  },
  
  // File content minimization
  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      new CSSMinimizer({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      })
    ]
  },
  
  // Entry files
  entry: {},
  
  // Output configuration
  output: {
    // Remove the old files
    clean: {
      keep (asset) {
        return asset.includes('assets.json');
      },
    },
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    chunkFilename: "[id].[contenthash].chunk.min.js",
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    filename: "[name].[contenthash].min.js",
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    assetModuleFilename: "[name].[contenthash].asset.min[ext]",
  },
};

export default defaultConfig;