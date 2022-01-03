# Webpack Configuration Builder

This module aims to help you quickly build Webpack configurations for your projects with important settings already all set for you



## Table of contents

- [Quick Start](#quick-start)
- [What's enabled by default](#enabled-by-default)
- [Documentation](#documentation)
  - [Output path](#output-path)
  - [Entries](#entries)
  - [Filename hash](#filename-hash)
  - [Asset file system](#asset-file-system)
  - [Output Cleaning](#output-cleaning)
  - [Optimization](#optimization)
  - [Webpack plugins management](#webpack-plugin-management)
    - [Add new plugins](#add-new-plugins)
    - [Disable default plugins](#disable-default-plugins)
  - [Environment variables](#environment-variables)
  - [Get your webpack configuration (and customizing it)](#get-your-webpack-configuration)



<a name="quick-start"></a>

## Quick Start

1. Install `build-kit` to your project 

   ```shell
   npm i --save-dev @ae/build-kit
   ```

2. Install `webpack` to your project by following the instructions of the [webpack documentation](https://webpack.js.org/guides/installation/)

3. Create a `webpack.config.js` file at your project's root and import the configuration builder

   ```js
   const path = require('path');
   
   // Import the Configuration Builder
   const { WebpackConfigBuilder } = require('build-kit');
   
   const config = WebpackConfigBuilder()
   	// Define an output path (required)
     .setOutputPath( path.join( __dirname, './dist') )
     // Add your first entry point
     .addEntry(
        path.resolve(__dirname, './assets/main.ts'), // Input path
       'main' // Will be outputed in _OUTPUT_PATH_/main.min.js
     )
   	// Gets a real webpack configuration object
     .build();
   
   // Exports the configuration built
   module.exports = config;
   ```

4. Add the following line to your `package.json`

   ```json
   {
     // ...
     "scripts" : {
       // ...
       "build": "webpack --config webpack.js",
       
       // Or if you have several profiles
       "build": "webpack --config webpack.prod.js",
       "dev": "webpack --config webpack.dev.js",
     }
     // ...
   }
   ```

5. You are good to go!



<a name="enabled-by-default"></a>

## What's enabled by default

- [x] **JavaScript** and **TypeScript** files support using Babel Loader
- [x] **CSS**, **SCSS** **and** **Tailwind** support
- [x] Inclusion of **Fonts** (.woff, .woff2, .ttf, .eot), **Icons** (.svg) and **Images** (.jpg, .png) into a dedicated sub folder
- [x] A more readble Webpack console output
- [x] Hashed filenames 
- [x] Output optimization
- [x] `assets.json` file generation that will contain all names of assets generated
- [x] Environment variables `PRODUCTION` (bool) and `DEBUG` (bool) available in global scope to help you determine your environment



<a name="documentation"></a>

## Documentation



<a name="output-path"></a>

### Output path

⚠️ This setting is **required**. If not provided, an error will be thrown during your webpack build.

```js
const path = require('path');

WebpackConfigBuilder().setOutputPath( path.join( __dirname, './dist') )
```



<a name="entries"></a>

### Entries

You can add one or more entries by using the `.addEntry()` method

```js
WebpackConfigBuilder().addEntry('input_path', 'output_name_without_extension')

// Examples
WebpackConfigBuilder()
  .addEntry(
     path.resolve(__dirname, './assets/main.ts'),
    'modules/main' // Will be written in __OUTPUT_PATH__/modules/main
  )
```



### Filename hash

By default, the files generated will include a unique hash generated from their content. It will ease the CDN and other caches managment by forcing systems to load your new version instead of serving your old one, which may causes user's browsers who have cached it to continue serving the old one.

You can however disable it using the `WebpackConfigBuilder.enableFilenamesHash()` method. 

```js
// Disabled
WebpackConfigBuilder().enableFilenamesHash(false)

// Enabled (by default)
WebpackConfigBuilder().enableFilenamesHash(true)
```

To help you to deal with hashed names, you can use the `assets.json` generated file.



<a name="asset-file-system"></a>

### Asset file system

The asset file generation can be very useful combined to the filename hashing system. When enabled, webpack will generate an `assets.json` file at the root of your output path. 

This file will contain each generated file path that you must include on your web page. Each entry is corresponding to one of your entry point and lists all files generated for this entry. Here is an example of what this file will contain :

```json
{
  "__OUTPUT_NAME__": {
    "css": [
      "__CSS_FILE_1__",
      "__CSS_FILE_2__"
    ],
    "js": [
      "__JS_FILE_1__",
      "__JS_FILE_2__"
    ]
  },
  "modules/main": {
    "css": [
      "modules/main/main.35f447259ce880869d82.min.css"
    ],
    "js": [
      "modules/main/main.ec816cfcd5fa8f21eb24.min.js"
    ]
  },
}
```

> `__OUTPUT_PATH__/assets.json`



<a name="output-cleaning"></a>

### Output Cleaning

⚠️ **Be careful with this setting** as it will delete all files which is not generated by webpack in your output directory defined by `.setOutputPath()`. So for example, if you've set `./` as your output path, it will whipeout your project. **Be sure to correctly define your output path before turning on output cleaning feature**.

This feature  allows your to automatically delete files generated by webpack. It is useful when you use filename hashing feature as your files will get another filename at each modification and, therefore, will not override old versions of them.

```js
WebpackConfigBuilder()
	.enableOutputCleaning(true)
```

You can also define custom files which will not be deleted by using `.setAssetCleaningWhitelist()` method :

```js
// Using a full filename
WebpackConfigBuilder()
	.enableOutputCleaning(true)
	// Prevents my-file-to-preverse.json to be cleaned by webpack
	.setAssetCleaningWhitelist( (assetName) => {
  	return assetName.includes('my-file-to-preserve.json');
	})

// Using a regex
WebpackConfigBuilder()
	.enableOutputCleaning(true)
	// Prevents .json files to be cleaned by webpack
	.setAssetCleaningWhitelist( (assetName) => {
  	return assetName.match(/\.json$/);
	})
```

> `assetName` is a string representing the asset file name



<a name="optimization"></a>

### Optimization

By default, assets will be optimized for production by using minification. You can control it through `.enableOptimization()` method :

```js
// Enable (by default)
WebpackConfigBuilder().enableOptimization(true);

// Disabled
WebpackConfigBuilder().enableOptimization(false);

// Dynamic
const isProduction = process.env.NODE_ENV === 'production';
WebpackConfigBuilder().enableOptimization( isProduction );
```



<a name="webpack-plugin-management"></a>

### Webpack plugins management

You can add custom plugins to the webpack configuration or also disable the plugins enabled by default.



<a name="add-new-plugins"></a>

#### Add new plugins

You can add new plugins to the configuration by using `` method. You should pass an object containing options and a init callback just as below.

```js
WebpackConfigBuilder()
	// Add a plugin without options
	.addPlugin({
  	init: () => (new DuplicatePackageCheckerPlugin()) as WebpackPlugin,
  })

	// Add a plugin which require options
	.addPlugin({
  	// Defines the options
  	options: {
    	filename: "[name].[contenthash].min.css"
    },
  	// Gets the options as callback parameter to initialize your plugin
    init: (options) => new MiniCssExtractPlugin(options),
  }),
```

If you're using typescript and wants to typecheck your plugin configuration, you can do it like this 

```typescript
// TypeScript example
WebpackConfigBuilder()
	.addPlugin({
  	options: {
    	filename: "[name].[contenthash].min.css"
    },
    init: (options:MiniCssExtractPlugin.PluginOptions) => new MiniCssExtractPlugin(options),
  } as WebpackPluginInitializer<MiniCssExtractPlugin.PluginOptions>),
```



<a name="disable-default-plugins"></a>

#### Disable default plugins

By default, the output configuration will come with two default plugins:

- `DuplicatePackageCheckerPlugin` to help you optimize your code
- `MiniCssExtractPlugin` which is required to define the output name of CSS files



However, you can disable them by using the `.enableDefaultPlugins()` method :

```js
// Enabled (default)
WebpackConfigBuilder().enableDefaultPlugins(true);

// Disabled
WebpackConfigBuilder().enableDefaultPlugins(false);
```



<a name="environment-variables"></a>

### Environment variables

You can set and use environment variables globally available in your project thanks through `.addEnvironmentVariable()` method.

```js
// webpack.config.js
WebpackConfigBuilder()
	.addEnvironmentVariable('MY_KEY', 'myValue');
```

And then in your code 

```js
// main.ts
if (MY_KEY)
  console.log(`MY_KEY value is : ${MY_KEY}`);
```

To get better support in TypeScript, you can declare them globally :

```ts
// @types/global.d.ts
declare global {
  const MY_KEY:string;
}
```



By default, you have access to two environment variables to help you figure out in which environment you're running

```js
{
  DEBUG: process.env.NODE_ENV !== 'production',
	PRODUCTION: process.env.NODE_ENV === 'production'
}
```



<a name="get-your-webpack-configuration"></a>

### Get your webpack configuration (and customizing it)

By calling the `.build()` method, you will get your final webpack configuration object ready to be exported!

```js
const config = WebpackConfigBuilder().build();
module.exports = config;
```

However, sometimes you may need to adjust or do very specific things with webpack. Well, you still can! Just manipulate your `config` object before exporting it :

```js
const config = WebpackConfigBuilder().build();

// Custom modifications
config.plugins.push( new webpack.IgnorePlugin( /* ... */ ) );

module.exports = config;
```



