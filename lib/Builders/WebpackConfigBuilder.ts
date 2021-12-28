import {Configuration} from 'webpack';
import defaultConfig from '../../ConfigurationFiles/Webpack/DefaultConfig';


/**
 * A class helper to build WebPack Configuration files
 */
export class WebpackConfigBuilder {
  
  private readonly configuration:Configuration;
  
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
    // Add HASH to file name to reduce problems of CDN and browser cache
    this.configuration.output.chunkFilename = this.hashFilenames
      ? "[id].[contenthash].chunk.min.js"
      : "[id].[name].chunk.js";
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    this.configuration.output.filename = this.hashFilenames
      ? "[name].[contenthash].min.js"
      : "[name].js";
    
    // Add HASH to file name to reduce problems of CDN and browser cache
    this.configuration.output.assetModuleFilename = this.hashFilenames
      ? "[name].[contenthash].asset.min[ext]"
      : "[name].[hash].asset[ext]";
    
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
  
  
  public build ():Configuration {
    this
      // Compute filename configuration according to this.hashFilenames
      .applyFilenames();
    
    return this.configuration;
  }
  
}