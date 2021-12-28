import {Configuration} from 'webpack';
import defaultConfig, {
  defaultCSSConfig,
  defaultFontConfig,
  defaultIconsConfig,
  defaultImagesConfig,
  defaultJavaScriptConfig
} from '../../ConfigurationFiles/Webpack/DefaultConfig';
import {WebpackConfiguration, WebpackModuleRules} from "../../@types/webpack";

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
  private readonly moduleRules: WebpackModuleRules;
  
  /**
   * Defines if filenames will have a unique hash in their name or not
   *
   * @private
   */
  private hashFilenames:boolean = true;
  
  
  /**
   * The builder constructor
   */
  public constructor () {
    this.configuration = defaultConfig;
    
    this.moduleRules = {
      javaScript : defaultJavaScriptConfig,
      css: defaultCSSConfig,
      font : defaultFontConfig,
      images : defaultImagesConfig,
      icons: defaultIconsConfig,
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
   * Whether to generate hash on file names or not
   *
   * @param enabled
   */
  public enableFilenamesHash (enabled:boolean):WebpackConfigBuilder {
    this.hashFilenames = enabled;
    
    return this;
  }
  
  
  /**
   * Apply the filename configuration according to this.hashFilenames parameter
   *
   * @private
   */
  private applyFilenames ():WebpackConfigBuilder {
    // Chunks
    this.configuration.output.chunkFilename = this.hashFilenames
      ? "[id].[contenthash].chunk.min.js"
      : "[id].[name].chunk.js";
    
    // Filenames
    this.configuration.output.filename = this.hashFilenames
      ? "[name].[contenthash].min.js"
      : "[name].js";
    
    // Assets
    this.configuration.output.assetModuleFilename = this.hashFilenames
      ? "[name].[contenthash].asset.min[ext]"
      : "[name].[hash].asset[ext]";
    
    // Fonts
    this.moduleRules.font.generator.filename = this.hashFilenames
      ? "fonts/[name].[contenthash][ext]"
      : "fonts/[name][ext]";
    
    // Icons
    this.moduleRules.icons.generator.filename = this.hashFilenames
      ? "icons/[name].[contenthash][ext]"
      : "icons/[name][ext]";
      
    // Images
    this.moduleRules.images.generator.filename = this.hashFilenames
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
   * Gets the different modules rules that will be later applied on the webpack configuration object
   */
  public getModulesRules() : WebpackModuleRules {
    return this.moduleRules;
  }
  
  
  /**
   * Applies all the module rules to the real webpack configuration
   * @private
   */
  private applyModulesRules() : WebpackConfigBuilder {
    this.configuration.module.rules = Object.values(this.getModulesRules());
    
    return this;
  }
  
  /**
   * Gets the real webpack configuration
   */
  public build (): WebpackConfiguration {
    this
      // Compute filename configuration according to this.hashFilenames
      .applyFilenames()
      // Adds the rules
      .applyModulesRules();
    
    // @ts-ignore
    return this.configuration;
  }
  
}