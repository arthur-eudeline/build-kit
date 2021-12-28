import {WebpackConfigBuilder} from "../../../lib/Builders/WebpackConfigBuilder";


/**
 * Test for adding entries to the configuration
 */
test('Adds entries correctly', () => {
  const builder = new WebpackConfigBuilder();
  
  // Should be empty by default
  expect(
    Object.keys(builder.build().entry).length,
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
    Object.keys(output.entry).length,
    'Entry should have been added'
  ).toBeGreaterThan(0);
  
  // Checks that the entry is correctly added
  expect(output.entry).toHaveProperty('output-sub-dir/output-file')
  expect(output.entry).toMatchObject({
    'output-sub-dir/output-file': 'output-sub-dir/output-file'
  })
});

/**
 * Checks that all filenames are by default hashed
 */
test('Files names should be hashed by default', () => {
  const config = (new WebpackConfigBuilder()).build();
  
  // Assets
  expect(config.output.assetModuleFilename)
    .toContain('[contenthash]');
  
  // Chunk
  expect(config.output.chunkFilename)
    .toContain('[contenthash]');
  
  // Filename
  expect(config.output.filename)
    .toContain('[contenthash]');
  
  // Fonts
  const fontFilename = config.module.rules
    .filter((rule) => rule.name === 'Font')[0].generator.filename;
  
  expect(fontFilename, 'Fonts should be located in sub folders').toMatch(/^fonts\//);
  expect(fontFilename).toContain('[contenthash]');
  
  // Icons
  const iconsFilename = config.module.rules
    .filter((rule) => rule.name === 'Icons')[0].generator.filename;
  
  expect(iconsFilename, 'Icons should be located in `icons` sub folder').toMatch(/^icons\//);
  expect(iconsFilename).toContain('[contenthash]');
  
  // Images
  const imagesFilename = config.module.rules
    .filter((rule) => rule.name === 'Images')[0].generator.filename;
  
  expect(imagesFilename, 'Images should be located in `img` sub folder').toMatch(/^img\//);
  expect(imagesFilename).toContain('[contenthash]');
});

/**
 * Checks that file names are not hashed anymore
 */
test('We should be able to turn off filename hashing', () => {
  // Enabled by default
  expect((new WebpackConfigBuilder()).build().output.filename)
    .toContain('[contenthash]');
  
  // We disable the filename hashing
  const config = (new WebpackConfigBuilder())
    .enableFilenamesHash(false)
    .build();
  
  // We should not have "contenthash" placeholder in filenames
  expect(config.output.filename)
    .not.toContain('[contenthash]');
  
  // Fonts
  const fontFilename = config.module.rules
    .filter((rule) => rule.name === 'Font')[0].generator.filename;
  expect(fontFilename).not.toContain('[contenthash]');
  
  // Icons
  const iconsFilename = config.module.rules
    .filter((rule) => rule.name === 'Icons')[0].generator.filename;
  expect(iconsFilename).not.toContain('[contenthash]');
  
  // Images
  const imagesFilename = config.module.rules
    .filter((rule) => rule.name === 'Images')[0].generator.filename;
  expect(imagesFilename).not.toContain('[contenthash]');
});

/**
 * Checks the output path
 */
test('We should be able to set output path', () => {
  const builder = new WebpackConfigBuilder();
  expect(builder.build().output.path).toBe(undefined);
  
  builder.setOutputPath('/dist');
  
  expect(builder.build().output.path).toEqual('/dist');
});

