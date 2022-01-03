import {WebpackConfigBuilder} from "../../../lib/Builders/WebpackConfigBuilder";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {DefinePlugin} from "webpack";
import validate from "webpack/schemas/WebpackOptions.check"


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
  const fontFilename = config.module.rules
    .filter((rule) => rule.name === 'Font')[0].generator!.filename;
  
  expect(fontFilename, 'Fonts should be located in sub folders').toMatch(/^fonts\//);
  expect(fontFilename).toContain('[contenthash]');
  
  // Icons
  const iconsFilename = config.module.rules
    .filter((rule) => rule.name === 'Icons')[0].generator!.filename;
  
  expect(iconsFilename, 'Icons should be located in `icons` sub folder').toMatch(/^icons\//);
  expect(iconsFilename).toContain('[contenthash]');
  
  // Images
  const imagesFilename = config.module.rules
    .filter((rule) => rule.name === 'Images')[0].generator!.filename;
  
  expect(imagesFilename, 'Images should be located in `img` sub folder').toMatch(/^img\//);
  expect(imagesFilename).toContain('[contenthash]');
  
  // Because we were debugging rules, we must remove rule.name property before checking config
  config.module.rules = config.module.rules.map((rule) => {
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
  const fontFilename = config.module.rules
    .filter((rule) => rule.name === 'Font')[0].generator!.filename;
  expect(fontFilename).not.toContain('[contenthash]');
  
  // Icons
  const iconsFilename = config.module.rules
    .filter((rule) => rule.name === 'Icons')[0].generator!.filename;
  expect(iconsFilename).not.toContain('[contenthash]');
  
  // Images
  const imagesFilename = config.module.rules
    .filter((rule) => rule.name === 'Images')[0].generator!.filename;
  expect(imagesFilename).not.toContain('[contenthash]');
  
  // Because we were debugging rules, we must remove rule.name property before checking config
  config.module.rules = config.module.rules.map((rule) => {
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
