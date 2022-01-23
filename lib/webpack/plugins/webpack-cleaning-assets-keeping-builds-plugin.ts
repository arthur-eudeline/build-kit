import {Compiler} from "webpack";
import path from "path";
import fs from "fs";
import glob from "glob";
import {flattenObject} from "../../common/utils";
import AssetsPlugin, {Assets} from 'assets-webpack-plugin';


type PluginSettings = {
  fileName:string,
  keepBuilds:number,
  keepFiles:Array<string | RegExp>
}

export class WebpackCleaningAssetsKeepingBuildsPlugin {
  
  private readonly settings:PluginSettings = {
    fileName: ".keep.json",
    keepBuilds: 0,
    keepFiles: [
      /assets\.[a-z]+$/
    ],
  };
  
  
  public constructor (settings:Partial<PluginSettings>) {
    settings.keepFiles = [...this.settings.keepFiles, ...(settings.keepFiles ?? [])];
    this.settings = {...this.settings, ...settings};
    
    // Adds the keep file to the safe list
    this.settings.keepFiles.push(this.settings.fileName);
  }
  
  
  public apply (compiler:Compiler) {
    this.addKeepFileGeneration(compiler);
    compiler.hooks.done.tap(this.constructor.name, () => this.deleteBuilds(compiler));
  }
  
  
  /**
   * Adds the keep file generation step to the webpack configuration
   * @param compiler
   * @private
   */
  private addKeepFileGeneration(compiler:Compiler) {
    compiler.options.plugins.push(new AssetsPlugin({
      path: compiler.options.output.path!,
      filename: this.settings.fileName,
      includeAllFileTypes: true,
      includeAuxiliaryAssets: true,
      includeDynamicImportedAssets: true,
      entrypoints: true,
      includeFilesWithoutChunk: true,
      prettyPrint: true,
      removeFullPathAutoPrefix: true,
      processOutput: (assets:Assets) => {
        // Deletes numeric indexes of the assets array which occurs during hot reload
        for (const key in assets) {
          if (key.match(/^[0-9]$/) !== null)
            delete assets[key];
        }
    
        // Converts the object into a single level array
        let assetsList = flattenObject(assets);
    
        // Remove non-uniques values in the array
        assetsList = assetsList.filter((value, index, self) => self.indexOf(value) === index);
        
        const previousReleasesFiles:string[][] = [];
        const filePath = path.join(  compiler.options.output.path!, this.settings.fileName );
        if (fs.existsSync(filePath))
          previousReleasesFiles.push( ...JSON.parse( fs.readFileSync(filePath).toString() ) );
    
        previousReleasesFiles.unshift( assetsList );
    
        // Keeps two releases
        const fileContent = previousReleasesFiles.slice(0, this.settings.keepBuilds + 1);
    
        return JSON.stringify(fileContent, null, 2);
      }
    }));
  }
  
  /**
   * Deletes the files that are not on a keep list
   * @param compiler
   * @private
   */
  private deleteBuilds (compiler:Compiler) {
    const filePath = path.join(compiler.options.output.path!, this.settings.fileName);
    
    // Holds the files that won't be deleted
    const filesKeepList:Array<string|RegExp> = [ ...this.settings.keepFiles ];
    
    // Adds the file extracted from our keep file if it exists
    if (fs.existsSync(filePath)) {
      const keepFileExtractedNames:string[][] = JSON.parse(fs.readFileSync(filePath).toString());
      filesKeepList.push( ...(keepFileExtractedNames.flat()) );
    }
    
    // Scans the output directory and gets all files relative paths
    const scanRes:string[] = glob.sync('**/*', {
      cwd: compiler.options.output.path!,
    });
    
    for (const file of scanRes) {
      const filePath = path.join(compiler.options.output.path!, file)
      
      // Does nothing if it is on keep list or if it is a directory
      if (filesKeepList.includes(file) || filesKeepList.filter(el => el instanceof RegExp && el.test(file)).length > 0 || fs.lstatSync(filePath).isDirectory())
        continue;
      
      // Delete it
      fs.unlinkSync(filePath);
    }
  }
}