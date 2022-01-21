// noinspection JSUnusedGlobalSymbols

import defaultConfig, {
  defaultCSSConfig,
  defaultFontConfig,
  defaultIconsConfig,
  defaultImagesConfig,
  defaultJavaScriptConfig
} from '../../configuration-files/webpack-config';
import {
  WebpackModuleRules, WebpackPlugin,
  WebpackPluginInitializer,
  WebpackRawConfiguration, WebpackStatsOptions, WebpackModuleLoaders, WebpackAssetFileFormat
} from "../../@types/webpack";
import {cloneDeep} from 'lodash';
import {DefinePlugin,} from "webpack";
import DuplicatePackageCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import AssetsPlugin from 'assets-webpack-plugin';
import {Logger} from "../Common/Logger";
import chalk from "chalk";
import {Configuration} from "webpack";
import {Static} from "webpack-dev-server";
import * as Path from "path";
import {TransformOptions} from "@babel/core";
import {BundleDeclarationsWebpackPlugin} from "bundle-declarations-webpack-plugin";

/**
 * A class helper to build WebPack Configuration files
 */
export class WebpackConfigBuilder {
  
  /**
   * Holds the Webpack configuration that will be manipulated
   * @private
   */
  private readonly configuration:WebpackRawConfiguration;
  
  /**
   * Holds the Webpack modules rules that will define how files are handled
   * @private
   */
  private readonly moduleRules:WebpackModuleRules;
  
  /**
   * Contains the default plugins added to the configuration
   * Use WebpackConfigBuilder.enableDefaultPlugins() to disable them
   * @private
   */
  private readonly defaultPlugins:{
    MiniCssExtractPlugin:WebpackPluginInitializer<MiniCssExtractPlugin.PluginOptions>,
    [key:string]:WebpackPluginInitializer,
  };
  
  /**
   * Holds a key-value map that will be used for set Environment variables
   * @private
   */
  private readonly environment:Record<string, any> = {
    DEBUG: process.env.NODE_ENV !== 'production',
    PRODUCTION: process.env.NODE_ENV === 'production'
  };
  
  /**
   * Allow or disallow the use of default plugins
   * @private
   */
  private defaultPluginsEnabled:boolean = true;
  
  /**
   * Allow or disallow babel default options
   * @private
   */
  private defaultBabelOptionsEnabled:boolean = true;
  
  /**
   * Whether or not to optimize assets code
   * @private
   */
  private optimizationEnabled:boolean = true;
  
  /**
   * Keeps or remove rules[].name which are handful for tests but
   * not authorized by webpack
   * @private
   */
  private debugRulesNamesEnabled:boolean = false;
  
  /**
   * Defines if Webpack will delete previous files when building new ones
   * @private
   */
  private outputCleaningEnabled:boolean = false;
  
  /**
   * Defines if webpack will generate an asset.json file containing each asset path
   * @private
   */
  private assetFileEnabled:boolean = true;
  
  /**
   * Defines the format of the asset json file format
   * @private
   */
  private assetFileFormat:WebpackAssetFileFormat = 'json';
  
  /**
   * Whether or not to add declaration files
   * @private
   */
  private enableTypeScriptDeclarations:boolean = true;
  
  /**
   * Holds the custom plugins later added to the configuration by the user
   * through WebpackConfigBuilder.addPlugin()
   * @private
   */
  private readonly plugins:WebpackPluginInitializer[] = [];
  
  /**
   * Defines if filenames will have a unique hash in their name or not
   *
   * @private
   */
  private hashFilenamesEnabled:boolean = true;
  
  /**
   * Holds the callback that prevent assets to be cleaned by Webpack
   * @private
   */
  private keepAssetsCB?:(fileName:string) => boolean;
  
  /**
   * Holds the different webpack entries
   * @private
   */
  private readonly entries:{inputPath:string, outputName:string}[] = [];
  
  
  /**
   * The builder constructor
   */
  public constructor () {
    this.configuration = cloneDeep(defaultConfig);
    
    this.moduleRules = {
      javaScript: cloneDeep(defaultJavaScriptConfig),
      css: cloneDeep(defaultCSSConfig),
      font: cloneDeep(defaultFontConfig),
      images: cloneDeep(defaultImagesConfig),
      icons: cloneDeep(defaultIconsConfig),
    };
    
    this.defaultPlugins = {
      // Remove duplicate assets code
      DuplicatePackageCheckerPlugin: {
        init: () => (new DuplicatePackageCheckerPlugin()) as unknown as WebpackPlugin,
      },

      // Extract CSS content into different files
      MiniCssExtractPlugin: {
        options: {
          filename: "[name].[contenthash].min.css"
        },
        init: (options:MiniCssExtractPlugin.PluginOptions) => new MiniCssExtractPlugin(options),
      } as WebpackPluginInitializer<MiniCssExtractPlugin.PluginOptions>,
      
      // Allow TypeScript declaration files generation
      BundleDeclarationWebpackPlugin: {
        init: () => {
          const output = [];

          for (const entry of this.entries) {
            output.push(new BundleDeclarationsWebpackPlugin({
              entry: entry.inputPath,
              outFile: entry.outputName + ".d.ts",
            }));
          }

          return output;
        },
      },
    };
  }
  
  
  /**
   * Adds a file to the Webpack entry list. Each entry will produce an output file
   *
   * @example <caption>Adds two entries that will be output in `__OUTPUT_DIR__/__OUTPUT_NAME__`</caption>
   * builder
   *  .addEntry( 'global', './src/assets/global.ts')
   *  .addEntry( 'modules/my-module', path.resolve(__dirname, './src/assets/modules/my-module.ts');
   *
   * @param inputPath The path to the bundle root file
   * @param outputName Where to write bundled result
   *
   * @returns {WebpackConfigBuilder} The current builder instance
   */
  public addEntry (inputPath:string, outputName:string):WebpackConfigBuilder {
    if (!this.configuration.entry)
      this.configuration.entry = {};
  
  
    (this.configuration.entry as Record<string, string>)[outputName] = inputPath;
    
    this.entries.push({inputPath, outputName});
    
    return this;
  }
  
  
  /**
   * Adds a plugin to the webpack configuration
   *
   * @param pluginInitializer
   */
  public addPlugin (pluginInitializer:WebpackPluginInitializer):WebpackConfigBuilder {
    this.plugins.push(pluginInitializer);
    
    return this;
  }
  
  
  /**
   * Sets an environment value through the Webpack Define plugin
   *
   * @param key
   * @param value
   */
  public addEnvironmentVariable (key:string, value:any):WebpackConfigBuilder {
    this.environment[key] = value;
    
    return this;
  }
  
  
  /**
   * Controls default plugin addition to the configuration
   * @param enable
   */
  public enableDefaultPlugins (enable:boolean):WebpackConfigBuilder {
    this.defaultPluginsEnabled = enable;
    return this;
  }
  
  
  /**
   * Enable the code generation optimization. Enabled by default
   * @param enable
   */
  public enableOptimization (enable:boolean):WebpackConfigBuilder {
    this.optimizationEnabled = enable;
    return this;
  }
  
  
  /**
   * Enable or disable the deletion of previous webpack generated output files
   * @param enable
   */
  public enableOutputCleaning (enable:boolean):WebpackConfigBuilder {
    this.outputCleaningEnabled = enable;
    return this;
  }
  
  
  /**
   * Sets a callback used to define if an asset will be cleaned or not by webpack.
   * If the callback return true, then the asset will NOT be deleted.
   *
   * @param keepAssets
   */
  public setAssetCleaningWhitelist (keepAssets:(fileName:string) => boolean):WebpackConfigBuilder {
    this.keepAssetsCB = keepAssets;
    
    return this;
  }
  
  
  /**
   * Allow to modify the babel loader options
   * @param setter
   */
  public setBabelOptions ( setter:((options:TransformOptions) => TransformOptions) ) : WebpackConfigBuilder {
    const babelRulesSet: WebpackModuleLoaders = (this.moduleRules.javaScript.use as WebpackModuleLoaders[]).filter(loaderOptions => loaderOptions.loader === 'babel-loader')[0];
    
    // Throw an error if we don't find the babel rules set
    if (
      !this.moduleRules.javaScript.use
      || babelRulesSet === undefined
      || !Array.isArray(this.moduleRules.javaScript.use)
      || typeof babelRulesSet !== 'object'
      || babelRulesSet.loader !== 'babel-loader'
    ) {
      Logger.error(`The ${ chalk.yellow.bold('Babel Loader') } cannot be found into the JavaScript file rules. Here is what has been found instead :
      ${ this.moduleRules.javaScript.rules }`);
      process.exit(1);
      return this;
    }
  
    (this.moduleRules.javaScript.use![0] as WebpackModuleLoaders).options = setter(babelRulesSet.options as TransformOptions);
    return this;
  }
  
  
  /**
   * Enable or disable the use of default BabelOptions.
   * If enabled, you can ONLY modify your babel options from webpack.config.js as any babel file will be ignored by webpack.
   * You must disable options to add your own babel file. You can still use default babel options as a preset as shown in the docs
   *
   * @see https://github.com/arthur-eudeline/build-kit/blob/master/docs/webpack-config-builder.md#babel-support
   * @param enabled
   */
  public enableDefaultBabelOptions(enabled: boolean) : WebpackConfigBuilder {
    this.defaultBabelOptionsEnabled = enabled;
    return this;
  }
  
  
  /**
   * Whether to generate hash on file names or not
   *
   * @param enabled
   */
  public enableFilenamesHash (enabled:boolean):WebpackConfigBuilder {
    this.hashFilenamesEnabled = enabled;
    
    return this;
  }
  
  
  public enableTypescriptDeclaration(enabled:boolean):WebpackConfigBuilder {
    this.enableTypeScriptDeclarations = enabled;
    return this;
  }
  
  /**
   * Keeps or remove rules[].name which are handful for tests but
   * not authorized by webpack
   * @param enabled
   */
  public debugRulesName(enabled: boolean):WebpackConfigBuilder {
    this.debugRulesNamesEnabled = enabled;
    return this;
  }
  
  
  /**
   * Defines if webpack will generate an "asset.json" file which will contain each file
   * path in it or not
   * @param enabled
   * @param fileFormat
   */
  public enableAssetFile (enabled:boolean, fileFormat:WebpackAssetFileFormat = 'json'):WebpackConfigBuilder {
    this.assetFileEnabled = enabled;
    this.assetFileFormat = fileFormat;
    return this;
  }
  
  
  /**
   * Apply the filename configuration according to this.hashFilenamesEnabled parameter
   *
   * @private
   */
  private applyFilenames ():WebpackConfigBuilder {
    if (!this.configuration.output)
      this.configuration.output = {};
    
    // Chunks
    this.configuration.output.chunkFilename = this.hashFilenamesEnabled
      ? "[id].[contenthash].chunk.min.js"
      : "[id].[name].chunk.js";
    
    // Filenames
    this.configuration.output.filename = this.hashFilenamesEnabled
      ? "[name].[contenthash].min.js"
      : "[name].js";
    
    // Assets
    this.configuration.output.assetModuleFilename = this.hashFilenamesEnabled
      ? "[name].[contenthash].asset.min[ext]"
      : "[name].[hash].asset[ext]";
    
    // CSS
    this.defaultPlugins.MiniCssExtractPlugin.options!.filename = this.hashFilenamesEnabled
      ? "[name].[contenthash].min.css"
      : "[name].css";
    
    // Fonts
    this.moduleRules.font.generator!.filename = this.hashFilenamesEnabled
      ? "fonts/[name].[contenthash][ext]"
      : "fonts/[name][ext]";
    
    // Icons
    this.moduleRules.icons.generator!.filename = this.hashFilenamesEnabled
      ? "icons/[name].[contenthash][ext]"
      : "icons/[name][ext]";
    
    // Images
    this.moduleRules.images.generator!.filename = this.hashFilenamesEnabled
      ? "img/[name].[contenthash][ext]"
      : "img/[name][ext]";
    
    return this;
  }
  
  
  /**
   * Sets the output directory
   *
   * @example
   * // Sets the output path to `src/assets/dist/`
   * builder.setOutputPath( path.resolve(__dirname, './src/assets/dist`) );
   *
   * @example
   * // Sets the output path to `src/assets/dist` and provide a relative path to simplify DevServer Configuration
   * builder.setOutputPath( {
   *    absolute: path.resolve(__dirname, './src/assets/dist`),
   *    relative: './src/assets/dist',
   * });
   *
   * @param path Where to output the bundled files
   *
   * @return {WebpackConfigBuilder} the current builder instance
   */
  public setOutputPath (path:string|{ relative?: string, absolute: string }):WebpackConfigBuilder {
    if (!this.configuration.output)
      this.configuration.output = {};

    // If the provided path is a string
    if (typeof path === 'string') {
      path = {absolute: path};
    }
    
    // Throw an error if we don't have absolute path passed
    if (path.absolute === undefined) {
      Logger.error(new Error(`You must provide at least an ${ chalk.yellow.bold('absolute path') } to the ${ chalk.yellow.bold('builder.setOutputPath()') } method :
      - ${ chalk.yellow.bold('builder.setOutputPath( path.resolve(__dirname, \'./src/assets/dist`) );') }
      - ${ chalk.yellow.bold('builder.setOutputPath( {\n' +
        '   absolute: path.resolve(__dirname, \'./src/assets/dist`),\n' +
        '   relative: \'./src/assets/dist\',\n' +
        '});\n')}
      `));
      process.exit(1);
      
      return this;
    }
    
    // Throw an error if the path.absolute value is not absolute
    if (!Path.isAbsolute(path.absolute)) {
      Logger.error(new Error(`The output path you have given is not an absolute path. You can specify one by using :
      - ${ chalk.yellow.bold('builder.setOutputPath( path.resolve(__dirname, \'./src/assets/dist`) );') }
      - ${ chalk.yellow.bold('builder.setOutputPath( {\n' +
        '   absolute: path.resolve(__dirname, \'./src/assets/dist`),\n' +
        '   relative: \'./src/assets/dist\',\n' +
        '});\n')}
      `));
      process.exit(1);
      
      return this;
    }
    
    this.configuration.output.path = path.absolute;

    // Required for the dev server
    if (path.relative) {
      path.relative = path.relative.replace(/^\./, '');
      
      this.configuration.output.publicPath = path.relative;
      this.addDevServerStatic({
        publicPath: path.relative,
        directory: path.absolute,
      });
    }
    
    return this;
  }
  
  
  /**
   * Defines the webpack stats configuration which modifies the webpack output
   * @param stats
   */
  public setStats (stats:WebpackStatsOptions):WebpackConfigBuilder {
    this.configuration.stats = stats;
    
    return this;
  }
  
  
  /**
   * Gets the different modules rules that will be later applied on the webpack configuration object
   */
  public getModulesRules ():WebpackModuleRules {
    return this.moduleRules;
  }
  
  
  /**
   * Allow add static entry to the WebpackDevServer
   * @param entry
   */
  public addDevServerStatic ( entry: Static ) : WebpackConfigBuilder {
    if (!this.configuration.devServer.static)
      this.configuration.devServer.static = [];
    
    this.configuration.devServer!.static.push(entry);
    
    return this;
  }
  
  
  /**
   * Applies all the module rules to the real webpack configuration
   * @private
   */
  private applyModulesRules ():WebpackConfigBuilder {
    const rules =  Object.values(cloneDeep(this.getModulesRules()));
    
      rules.map((value) => {
        if (value.name === 'JavaScript') {
          // Remove options from the babel loader if we don't want default rules
          if ( !this.defaultBabelOptionsEnabled )
            delete (value.use as Array<WebpackModuleLoaders>).filter((rule) => rule.loader === "babel-loader")[0]!.options;
  
          if ( !this.enableTypeScriptDeclarations ) {
            // Remove TS Loader to generate declarations file
            value.use = (value.use as Array<WebpackModuleLoaders>).filter((rule) => rule.loader !== "ts-loader");
          }
        }
        
        // Remove name property which is not valid for webpack
        if (!this.debugRulesNamesEnabled)
          delete value.name;
        
        return value;
      });
    
    this.configuration.module!.rules = rules;
    
    return this;
  }
  
  
  /**
   * Adds the default plugins and regular plugins to the configuration
   *
   * @private
   */
  private applyPlugins ():WebpackConfigBuilder {
    if (!this.enableTypeScriptDeclarations)
      delete this.defaultPlugins.BundleDeclarationWebpackPlugin;
    
    // Merge default plugins if they are enabled with user provided plugins
    const plugins:WebpackPluginInitializer[] = [
      ...(this.defaultPluginsEnabled ? Object.values(this.defaultPlugins) : []),
      ...this.plugins
    ];
    
    if (!this.configuration.plugins)
      this.configuration.plugins = [];
    
    // Initialize each plugin
    for (const initializer of plugins) {
      const initialized = initializer.init(initializer.options);
      if (Array.isArray(initialized)) {
        for (const single of initialized) {
          this.configuration.plugins.push(single)
        }
      } else {
        this.configuration.plugins.push(initialized);
      }
    }
    
    // Add environment values if some has been added
    if (Object.values(this.environment).length > 0)
      this.configuration.plugins.push(new DefinePlugin(this.environment));
    
    return this;
  }
  
  
  /**
   * Adds optimization configuration to the real webpack configuration
   * @private
   */
  private applyOptimization ():WebpackConfigBuilder {
    if (!this.optimizationEnabled) {
      this.configuration.optimization = {
        minimize: false,
      };

      return this;
    }
    
    this.configuration.optimization = {
      minimize: true,
      minimizer: [
        `...`,
        // @ts-ignore
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              "default",
              {
                discardComments: {removeAll: true},
              },
            ],
          },
        })
      ]
    };
    
    return this;
  }
  
  
  /**
   * Adds the asset cleaning configuration to the real webpack configuration
   * @private
   */
  private applyAssetCleaning ():WebpackConfigBuilder {
    if (!this.outputCleaningEnabled)
      return this;
    
    if (!this.configuration.output)
      this.configuration.output = {};
    
    if (this.keepAssetsCB)
      this.configuration.output.clean = {
        keep: this.keepAssetsCB
      };
    
    return this;
  }
  
  
  /**
   * Adds asset file generation settings to the real webpack configuration
   * @private
   */
  private applyAssetFile ():WebpackConfigBuilder {
    if(!this.assetFileEnabled)
      return this;
    
    if(!this.configuration.output)
      this.configuration.output = {};
    
    const outputPath = this.configuration.output.path;
    
    if (!this.configuration.plugins)
      this.configuration.plugins = [];

    this.configuration.plugins.push(new AssetsPlugin({
      path: outputPath ? outputPath : './',
      filename: `assets.${this.assetFileFormat}`,
      includeAllFileTypes: true,
      entrypoints: true,
      removeFullPathAutoPrefix: true,
      prettyPrint: true,
      includeDynamicImportedAssets: true,
      processOutput: (assets) => {
        for (const assetKey in assets) {
          const asset = assets[assetKey];
          for (const assetType in asset) {
            const assetsList = assets[assetKey][assetType];

            // Converts the assets in array if it is not
            if (!Array.isArray(assetsList)) {
              // @ts-ignore
              assets[assetKey][assetType] = [assetsList];
            }
          }

          // Adds the HotReload client script to the JS assets list if in development mode
          // if (!production) {
          //   if (!assets[assetKey].js) {
          //     // noinspection JSValidateTypes
          //     assets[assetKey].js = [];
          //   }
          //
          //   // How to add a new JS file
          //   // if (!assets[assetKey].js.includes('test.js')) { // noinspection JSUnresolvedFunction
          //   //   assets[assetKey].js.push('test.js');
          //   // }
          // }
        }

        const assetsJSON = JSON.stringify(assets, null, 2);
        
        if (this.assetFileFormat === "json") {
          return assetsJSON;
        } else {
          return `<?php $assetsContent = json_decode('${assetsJSON}', true);`;
        }
      },
    }));
    
    return this;
  }
  
  
  /**
   * Validate the Webpack configuration and throw errors if its not valid
   * @private
   */
  private validate() : void {
    // If we don't have path and we're not running tests
    if (this.configuration.output?.path === undefined && process.env.NODE_ENV !== 'test') {
      Logger.error(new Error(`You must define an output path by using ${
        chalk.yellow.bold('WebpackConfigBuilder.setOutputPath()')
      }`));
      process.exit(1);
    }
    
    // If we don't have public path set and we try to run serve to use webpack-dev-server
    if (!this.configuration.output.publicPath && process.argv.includes('serve')) {
      Logger.warn(`DevServer may not work as expected as you have not provided a relative path to the ${ chalk.yellow.bold('builder.setOutputPath()') } method.\n` +
      `You can provide one by using ${ chalk.yellow.bold('builder.setOutputPath({\n' +
        ' absolute: path.resolve(__dirname, \'./src/assets/dist`),\n' +
        ' relative: \'./src/assets/dist\',\n' +
        '});\n')}`);
    }
  }
  
  
  /**
   * Gets the real webpack configuration
   */
  public build ():Configuration {
    this
      // Compute filename configuration according to this.hashFilenamesEnabled
      .applyFilenames()
      // Adds the asset cleaning configuration
      .applyAssetCleaning()
      // Adds assets file generation
      .applyAssetFile()
      // WARNING : MUST COME AFTER APPLY FILENAMES, Adds default plugins
      .applyPlugins()
      // Adds the optimization settings
      .applyOptimization()
      // Adds the rules
      .applyModulesRules();
    
    // Will throw errors if the generated configuration is missing some fields
    this.validate();
    
    if (process.env.NODE_ENV !== 'test')
      Logger.success('Webpack Configuration built!');
    
    // @ts-ignore
    return this.configuration;
  }
}