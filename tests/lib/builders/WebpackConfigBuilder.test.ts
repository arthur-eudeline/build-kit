import {WebpackConfigBuilder} from "../../../lib/builders/webpack-config-builder";
// @ts-ignore
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {DefinePlugin, RuleSetRule, RuleSetUseItem} from "webpack";
// @ts-ignore
import validate from "webpack/schemas/WebpackOptions.check"
import {WebpackConfiguration, WebpackModuleRule} from "../../../@types/webpack";
import * as path from "path";
import consola from "consola";
import BundleDeclarationsWebpackPlugin from "bundle-declarations-webpack-plugin";


test('Configuration should be valid by default', () => {
  const builder = new WebpackConfigBuilder();
  builder.setOutputPath( path.join(__dirname, 'test' ) );
  
  expect(validate(builder.build())).toEqual(true);
});

/**
 * Test for adding entries to the configuration
 */
test('Adds entries correctly', () => {
  const builder = new WebpackConfigBuilder();
  
  // Should be empty by default
  expect(
    Object.keys(builder.build().entry as object).length,
    'Entries should be empty by default')
    .toEqual(0);
  
  // Adds the entry
  builder.addEntry(
    'output-sub-dir/output-file',
    'output-sub-dir/output-file'
  );
  
  const output = builder.build();
  
  // Checks that the entry object is not empty
  expect(
    Object.keys(output.entry as object).length,
    'Entry should have been added'
  ).toBeGreaterThan(0);
  
  // Checks that the entry is correctly added
  expect(output.entry).toHaveProperty('output-sub-dir/output-file');
  expect(output.entry).toMatchObject({
    'output-sub-dir/output-file': 'output-sub-dir/output-file'
  });
  expect(validate(output)).toEqual(true);
});

/**
 * Checks that all filenames are by default hashed
 */
test('Files names should be hashed by default', () => {
  const config = (new WebpackConfigBuilder())
    .debugRulesName(true)
    .build();
  
  // Assets
  expect(config.output!.assetModuleFilename)
    .toContain('[contenthash]');
  
  // Chunk
  expect(config.output!.chunkFilename)
    .toContain('[contenthash]');
  
  // Filename
  expect(config.output!.filename)
    .toContain('[contenthash]');
  
  // Fonts
  const fontFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Font')[0].generator!.filename;
  
  expect(fontFilename, 'Fonts should be located in sub folders').toMatch(/^fonts\//);
  expect(fontFilename).toContain('[contenthash]');
  
  // Icons
  const iconsFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Icons')[0].generator!.filename;
  
  expect(iconsFilename, 'Icons should be located in `icons` sub folder').toMatch(/^icons\//);
  expect(iconsFilename).toContain('[contenthash]');
  
  // Images
  const imagesFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Images')[0].generator!.filename;
  
  expect(imagesFilename, 'Images should be located in `img` sub folder').toMatch(/^img\//);
  expect(imagesFilename).toContain('[contenthash]');
  
  // Because we were debugging rules, we must remove rule.name property before checking config
  config.module!.rules = (config.module!.rules! as WebpackModuleRule[]).map((rule) => {
    delete rule.name;
    return rule;
  });
  
  expect(validate(config)).toEqual(true);
});

/**
 * Checks that file names are not hashed anymore
 */
test('We should be able to turn off filename hashing', () => {
  // Enabled by default
  expect((new WebpackConfigBuilder()).build().output!.filename)
    .toContain('[contenthash]');
  
  // We disable the filename hashing
  const config = (new WebpackConfigBuilder())
    .enableFilenamesHash(false)
    .debugRulesName(true)
    .build();
  
  // We should not have "contenthash" placeholder in filenames
  expect(config.output!.filename)
    .not.toContain('[contenthash]');
  
  // Fonts
  const fontFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Font')[0].generator!.filename;
  expect(fontFilename).not.toContain('[contenthash]');
  
  // Icons
  const iconsFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Icons')[0].generator!.filename;
  expect(iconsFilename).not.toContain('[contenthash]');
  
  // Images
  const imagesFilename = (config.module!.rules! as WebpackModuleRule[])
    .filter((rule) => rule.name === 'Images')[0].generator!.filename;
  expect(imagesFilename).not.toContain('[contenthash]');
  
  // Because we were debugging rules, we must remove rule.name property before checking config
  config.module!.rules =(config.module!.rules! as WebpackModuleRule[]).map((rule) => {
    delete rule.name;
    return rule;
  });
  
  expect(validate(config)).toEqual(true);
});

/**
 * Checks the output path
 */
test('We should be able to set output path', () => {
  const builder = new WebpackConfigBuilder();
  expect(builder.build().output!.path).toBe(undefined);
  
  builder.setOutputPath('/dist');
  
  expect(builder.build().output!.path).toEqual('/dist');
  expect(validate(builder.build())).toEqual(true);
});

/**
 * Checks if we can enable and disable optimization
 */
test('We should be able to disable optimization', () => {
  const builder = new WebpackConfigBuilder();
  
  expect(
    builder.build().optimization!.minimize,
    'By default, Optimization should be enabled'
  ).toEqual(true);
  
  builder.enableOptimization(false);
  
  expect(
    builder.build().optimization!.minimize,
    'We should be able to turn off Optimization'
  ).toEqual(false);
});

/**
 * Plugin support
 */
describe('Plugins support', () => {
  /**
   * Tests that we have defaults plugins added to the final configuration object
   */
  test('We should have default plugins', () => {
    const builder = new WebpackConfigBuilder();
    // By default it should have one plugin
    expect(
      builder.build().plugins!.filter(plugin => plugin.constructor.name === 'MiniCssExtractPlugin').length,
      'We should find the default MiniCSSExtractPlugin plugin in the config'
    ).toEqual(1);
    expect(validate(builder.build())).toEqual(true);
  });
  
  /**
   * Test that we are able to disable the defaults plugins
   */
  test('We should be able to disable default plugins', () => {
    // Disable de default plugins
    const builder = new WebpackConfigBuilder();
    builder.enableDefaultPlugins(false);
  
    expect(
      builder.build().plugins!.filter(plugin => plugin.constructor.name === 'MiniCssExtractPlugin').length,
      'We should not find the default MiniCSSExtractPlugin plugin in the config'
    ).toEqual(0);
  
    expect(validate(builder.build())).toEqual(true);
  });
  
  /**
   * Test that we are able to add new plugins
   */
  test('We should be able to add plugins', () => {
    const builder = new WebpackConfigBuilder();
    builder.addPlugin({
      options: {
        filename: '[name].css',
      },
      init: (options) => new MiniCssExtractPlugin(options),
    });
    
    builder.enableDefaultPlugins(false);
    const config = builder.build();
    
    expect(
      config.plugins!.filter(plugin => plugin.constructor.name === 'MiniCssExtractPlugin').length,
      'We should have a MiniCSSExtractPlugin in the output configuration'
    ).toEqual(1);
  
    expect(validate(builder.build())).toEqual(true);
  });
  
  /**
   * Test that we are able to add new plugins
   */
  test('We should be able to define environment variables', () => {
    const builder = new WebpackConfigBuilder();
    builder.addEnvironmentVariable('MY_VAR', 'MY_VALUE');
    
    builder.enableDefaultPlugins(false);
    const config = builder.build();
    
    const plugins = config.plugins!.filter(plugin => plugin.constructor.name === 'DefinePlugin');
    expect(
      plugins.length,
      'We should have a DefinePlugin in the output configuration'
    ).toEqual(1);
    
    const definePlugin = plugins[0] as DefinePlugin;
    expect(definePlugin.definitions).toHaveProperty('DEBUG', true);
    expect(definePlugin.definitions).toHaveProperty('PRODUCTION', false);
    expect(definePlugin.definitions).toHaveProperty('MY_VAR', 'MY_VALUE');
    expect(validate(config)).toEqual(true);
  });
});

/**
 *
 */
describe('Output Path', () => {
  let mockExit: jest.SpyInstance;
  let mockConsola: jest.SpyInstance;
  
  beforeAll(() => {
    mockExit = jest.spyOn(process, 'exit')
      // @ts-ignore
      .mockImplementation((code?:number) : never => {} );
  
    mockConsola = jest.spyOn(consola, 'error')
      .mockImplementation( args => {});
  })
  
  test('Output path should be able to be set as string', () => {
    const config = (new WebpackConfigBuilder())
      .setOutputPath( path.join(__dirname, 'test') )
      .build();
    
    expect(config.output!.path).toEqual( path.join(__dirname, 'test' ) );
    expect(validate(config)).toEqual(true);
  });
  
  test('Output path should be able to be set as object', () => {
    const config = (new WebpackConfigBuilder())
      .setOutputPath({absolute: '/Users/tests/my-path' })
      .build();
  
    expect(config.output!.path).toEqual( '/Users/tests/my-path' );
    expect(validate(config)).toEqual(true);
  });
  
  test('Should throw an error if path is not absolute', () => {
    mockConsola.mockReset();
    mockExit.mockReset();
    
    (new WebpackConfigBuilder())
      .setOutputPath('./test')
      .build();
  
    expect(mockExit).toHaveBeenLastCalledWith(1);
    expect(mockConsola).toHaveBeenCalled();
  });
  
  test('Should throw an error if only a path.relative is the only property passed', () => {
    mockConsola.mockReset();
    mockExit.mockReset();
  
    (new WebpackConfigBuilder())
      // @ts-ignore
      .setOutputPath({relative: './test'})
      .build();
  
    expect(mockExit).toHaveBeenLastCalledWith(1);
    expect(mockConsola).toHaveBeenCalled();
  });
  
  test('Should throw an error if the path.absolute value is relative', () => {
    mockConsola.mockReset();
    mockExit.mockReset();
  
    (new WebpackConfigBuilder())
      // @ts-ignore
      .setOutputPath({absolute: './test' })
      .build();
  
    expect(mockExit).toHaveBeenLastCalledWith(1);
    expect(mockConsola).toHaveBeenCalled();
  });
  
  afterAll(() => {
    mockExit.mockRestore();
    mockConsola.mockRestore();
  })
});


/**
 * Babel loader tests
 */
describe('Babel Loader', () => {
  
  const getJSRules = (config: WebpackConfiguration) : WebpackModuleRule | undefined => {
    const result = config.module.rules.filter( (value:WebpackModuleRule) => {
      return value.test!.toString() === '/\\.(ts)|(js)$/';
    } );
    
    return result.length > 0
      ? result[0]
      : undefined;
  }
  
  const getBabelConfig = (config: WebpackConfiguration): RuleSetRule | undefined => {
    const result = getJSRules(config);
    
    if (!result || !Array.isArray(result.use))
      return;
  
    const loaders = (result.use as RuleSetRule[]).filter( (value:RuleSetRule) => value.loader === 'babel-loader');
    
    if (loaders.length < 1)
      return;
    
    return loaders[0];
  }
  
  const DefaultBabelConfig = require ('../../../configuration-files/babel-config');
  
  test('Should get default value by default', () => {
    const config = new WebpackConfigBuilder().build();

    expect(getBabelConfig(config as WebpackConfiguration)?.options).toMatchObject( DefaultBabelConfig() );
    expect(validate(config)).toEqual(true);
  });
  
  test('Should be able to change default value', () => {
    const config = (new WebpackConfigBuilder())
      .setBabelOptions( (options) => {
        delete options.sourceType;
        return options;
      } )
      .build();
    
    const babelConfig = getBabelConfig(config as WebpackConfiguration)?.options
    expect(babelConfig).not.toBeUndefined();
    
    expect(babelConfig).not.toMatchObject( DefaultBabelConfig() );
    
    // @ts-ignore
    expect(babelConfig?.sourceType).toBeUndefined();
    
    expect(validate(config)).toEqual(true);
  });
  
  test('We should be able to remove default babel options', () => {
    const config = new WebpackConfigBuilder()
      .enableDefaultBabelOptions(false)
      .build();
  
    expect(getBabelConfig(config as WebpackConfiguration)?.options).toBeUndefined();
    expect(validate(config)).toEqual(true);
  })
});

describe('TypeScript loader', () => {
  test('Presence if true', () => {
    const builder = new WebpackConfigBuilder();
    builder.addEntry('/test/test-file.ts', 'test');
    builder.debugRulesName(true);
    builder.enableTypescriptDeclaration(true);
    
    const config = builder.build();
    const javaScriptLoader:WebpackModuleRule = (config.module!.rules as WebpackModuleRule[]).filter(rule => rule.name! === 'JavaScript')[0]!;
    
    expect((javaScriptLoader.use as { loader:string }[]).filter(loader => loader.loader === 'ts-loader')).toHaveLength(1);
    
    const declarationPlugins = config.plugins!.filter(plugin => plugin instanceof BundleDeclarationsWebpackPlugin);
    // @ts-ignore
    const {outFile, entry} = declarationPlugins[0].options;
    expect(declarationPlugins).toHaveLength(1);
    expect(entry).toEqual("/test/test-file.ts");
    expect(outFile).toEqual("test.d.ts");
    
    // @ts-ignore
    config.module!.rules.map(rule => { delete rule.name!; });
    
    expect(validate(config)).toEqual(true);
  });
  
  test('Absence if false', () => {
    const builder = new WebpackConfigBuilder();
    builder.addEntry('/test/test-file.ts', 'test');
    builder.debugRulesName(true);
    builder.enableTypescriptDeclaration(false);
  
    const config = builder.build();
    const javaScriptLoader:WebpackModuleRule = (config.module!.rules as WebpackModuleRule[]).filter(rule => rule.name! === 'JavaScript')[0]!;
  
    expect((javaScriptLoader.use as { loader:string }[]).filter(loader => loader.loader === 'ts-loader')).toHaveLength(0);
  
    const declarationPlugins = config.plugins!.filter(plugin => plugin instanceof BundleDeclarationsWebpackPlugin);
    expect(declarationPlugins).toHaveLength(0);
  
    // @ts-ignore
    config.module!.rules.map(rule => { delete rule.name!; });
  
    expect(validate(config)).toEqual(true);
  });
});