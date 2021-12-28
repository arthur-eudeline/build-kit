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