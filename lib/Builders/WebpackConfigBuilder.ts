// noinspection JSUnusedGlobalSymbols

import {Configuration, DefinePlugin, StatsOptions} from 'webpack';
import defaultConfig, {
  defaultCSSConfig,
  defaultFontConfig,
  defaultIconsConfig,
  defaultImagesConfig,
  defaultJavaScriptConfig
} from '../../ConfigurationFiles/Webpack/DefaultConfig';
import {WebpackConfiguration, WebpackModuleRules, WebpackPluginInitializer} from "../../@types/webpack";
import DuplicatePackageCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {cloneDeep} from 'lodash';
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import {resolve} from "path";
import * as AssetsPlugin from 'assets-webpack-plugin';


/**
 * A class helper to build WebPack Configuration files
 */
export class WebpackConfigBuilder {
  
  /**
   * Holds the Webpack configuration that will be manipulated
   * @private
   */
  private readonly configuration:Configuration;
  
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
    MiniCssExtractPlugin:WebpackPluginInitializer<MiniCssExtractPlugin.PluginOptions>
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
   * Whether or not to optimize assets code
   * @private
   */
  private optimizationEnabled:boolean = true;
  
  /**
   * Defines if Webpack will delete previous files when building new ones
   * @private
   */
  private outputCleaningEnabled:boolean = true;
  
  /**
   * Defines if webpack will generate an asset.json file containing each asset path
   * @private
   */
  private assetFileEnabled:boolean = true;
  
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
  private keepAssetsCB:(fileName:string) => boolean;
  
  
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
        init: () => new DuplicatePackageCheckerPlugin()
      },
      
      // Extract CSS content into different files
      MiniCssExtractPlugin: {
        options: {
          filename: "[name].[contenthash].min.css"
        },
        init: (options:MiniCssExtractPlugin.PluginOptions) => new MiniCssExtractPlugin(options),
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
    this.configuration.entry[outputName] = inputPath;
    
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
  public enableOutputCleaning(enable:boolean):WebpackConfigBuilder {
    this.outputCleaningEnabled = enable;
    return this;
  }
  
  
  /**
   * Sets a callback used to define if an asset will be cleaned or not by webpack.
   * If the callback return true, then the asset will NOT be deleted.
   *
   * @param keepAssets
   */
  public setAssetCleaningWhitelist( keepAssets: (fileName:string) => boolean):WebpackConfigBuilder {
    this.keepAssetsCB = keepAssets;
    
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
  
  
  /**
   * Defines if webpack will generate an "asset.json" file which will contain each file
   * path in it or not
   * @param enabled
   */
  public enableAssetFile(enabled:boolean):WebpackConfigBuilder {
    this.assetFileEnabled = enabled;
    return this;
  }
  
  /**
   * Apply the filename configuration according to this.hashFilenamesEnabled parameter
   *
   * @private
   */
  private applyFilenames ():WebpackConfigBuilder {
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
    this.defaultPlugins.MiniCssExtractPlugin.options.filename = this.hashFilenamesEnabled
      ? "[name].[contenthash].min.css"
      : "[name].css";
    
    // Fonts
    this.moduleRules.font.generator.filename = this.hashFilenamesEnabled
      ? "fonts/[name].[contenthash][ext]"
      : "fonts/[name][ext]";
    
    // Icons
    this.moduleRules.icons.generator.filename = this.hashFilenamesEnabled
      ? "icons/[name].[contenthash][ext]"
      : "icons/[name][ext]";
    
    // Images
    this.moduleRules.images.generator.filename = this.hashFilenamesEnabled
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
   * @param path Where to output the bundled files
   *
   * @return {WebpackConfigBuilder} the current builder instance
   */
  public setOutputPath (path:string):WebpackConfigBuilder {
    this.configuration.output.path = path;
    
    return this;
  }
  
  
  /**
   * Defines the webpack stats configuration which modifies the webpack output
   * @param stats
   */
  public setStats( stats:StatsOptions ):WebpackConfigBuilder {
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
   * Applies all the module rules to the real webpack configuration
   * @private
   */
  private applyModulesRules ():WebpackConfigBuilder {
    this.configuration.module.rules = Object.values(this.getModulesRules());
    
    return this;
  }
  
  
  /**
   * Adds the default plugins and regular plugins to the configuration
   *
   * @private
   */
  private applyPlugins ():WebpackConfigBuilder {
    // Merge default plugins if they are enabled with user provided plugins
    const plugins:WebpackPluginInitializer[] = [
      ...(this.defaultPluginsEnabled ? Object.values(this.defaultPlugins) : []),
      ...this.plugins
    ];
    
    // Initialize each plugin
    for (const initializer of plugins) {
      this.configuration.plugins.push(initializer.init(initializer.options));
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
  private applyOptimization():WebpackConfigBuilder {
    if (!this.optimizationEnabled)
      return this;
    
    this.configuration.optimization = {
      minimize: true,
      minimizer: [
        `...`,
        new CssMinimizerPlugin({
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
    };
    
    return this;
  }
  
  
  /**
   * Adds the asset cleaning configuration to the real webpack configuration
   * @private
   */
  private applyAssetCleaning():WebpackConfigBuilder {
    if (!this.outputCleaningEnabled)
      return this;
    
    this.configuration.output.clean = {
      keep: this.keepAssetsCB
    };
    
    return this;
  }
  
  
  /**
   * Adds asset file generation settings to the real webpack configuration
   * @private
   */
  private applyAssetFile():WebpackConfigBuilder {
    this.configuration.plugins.push(new AssetsPlugin({
      path: resolve(this.configuration.output.path, './src/Assets/dist/'),
      filename: 'assets.json',
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
    
        return JSON.stringify(assets, null, 2);
      },
    }));
    return this;
  }
  
  /**
   * Gets the real webpack configuration
   */
  public build ():WebpackConfiguration {
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
    
    // @ts-ignore
    return this.configuration;
  }
  
}