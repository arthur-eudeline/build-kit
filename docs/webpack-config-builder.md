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
  - [Webpack Dev Server](#webpack-dev-server)
    - [Correctly set output path](#correctly-set-output-path)
    - [Add static entries](#add-static-entries)
    - [How to start the server](#start-the-server)



<a name="quick-start"></a>

## Quick Start

1. Install `@arthur.eudeline/build-kit` to your project 

   ```shell
   npm i -D @arthur.eudeline/build-kit
   ```

   > No need to install webpack ! It's already included into the build bit

3. Create a `webpack.config.js` file at your project's root and import the configuration builder

   ```js
   const path = require('path');
   
   // Import the Configuration Builder
   const { WebpackConfigBuilder } = require('@arthur.eudeline/build-kit');
   
   const config = WebpackConfigBuilder()
   	// Define an output path (required)
     .setOutputPath( path.join( __dirname, './dist') )
     // Add your first entry point
     .addEntry(
        path.resolve(__dirname, './assets/main.ts'), // Input path
       'main' // Will be outputted in _OUTPUT_PATH_/main.min.js
     )
   	// Gets a real webpack configuration object
     .build();
   
   // Exports the configuration built
   module.exports = config;
   ```

3. Add the following line to your `package.json`

   ```jsonc
   {
     // ...
     "scripts" : {
       // ...
       "build": "webpack --config webpack.js",
       
       // Or if you have several profiles
       "build": "webpack --config webpack.prod.js --mode production",
       "dev": "webpack --config webpack.dev.js --mode development",
       
       // To use webpack dev server
       "serve": "webpack serve --mode development"
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
- [x] A more readable Webpack console output
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

// You must provide an absolute path here
WebpackConfigBuilder().setOutputPath( path.join( __dirname, './dist') )

// Alternative solution
WebpackConfigBuilder().setOutputPath( {
  absolute: path.join( __dirname, './dist'), // Required
	relative: './dist', // Optional but recommended as it will simplify the WebpackDevServer configuration
} )
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

By default, the files generated will include a unique hash generated from their content. It will ease the CDN and other caches management by forcing systems to load your new version instead of serving your old one, which may causes user's browsers who have cached it to continue serving the old one.

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

⚠️ **Be careful with this setting** as it will delete all files which is not generated by webpack in your output directory defined by `.setOutputPath()`. So for example, if you've set `./` as your output path, it will wipe out your project. **Be sure to correctly define your output path before turning on output cleaning feature**.

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

You can add new plugins to the configuration by using `addPlugin` method. You should pass an object containing options and an init callback just as below.

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

If you're using typescript and wants to typechecking your plugin configuration, you can do it like this 

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

```typescript
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



<a name="webpack-dev-server"></a>

### Webpack Dev Server

You can also use [Webpack Dev Server](https://webpack.js.org/configuration/dev-server/) to speed up your development process. It will start a development server on your localhost at port `9000`  and will include hot reload (or hot refresh) by default. 

> Hot reload and hot refresh will auto refresh your page when you make changes in your code. It is very convenient for front-end development as you'll see your changes in real time without having to hit the refresh button each time



<a name="correctly-set-output-path"></a>

#### Correctly set output path

⚠️ To use it, we highly recommend to pass a `path` object to the `builder.setOutputPathMethod()` such as : 

```js
WebpackConfigBuilder().setOutputPath( {
  absolute: path.join( __dirname, './dist'),
	relative: './dist',
} )
```

Doing this will ease your Webpack Dev Server set up process as it will set fields to the webpack configuration that are required by the server to work correctly. 



<a name="add-static-entries"></a>

#### Add static entries

Let say that your code is built in `./dist` directory and you want to add a `./demo` folder to your library project in order to provide real code exemples to your future users. So, basically your project will look like this :

```
- ./
	| - lib/
  |	| - index.ts
  | - dist/
  |	| - index.min.js
  |	| - assets.json
  | - demo/
  | | - index.html
  | | - demo-script.js
```

To do this, you should add a static entry like this :

```js
WebpackConfigBuilder()
	// Required step
  .setOutputPath( {
  	absolute: path.join( __dirname, './dist'),
		relative: './dist',
	} )
	// Add the /demo folder
	.addDevServerStatic({
    directory: join(__dirname, 'demo'),
    publicPath: '/',
  })
```

By doing so, when you'll access `http://localhost:9000`, all your built assets will be available at `http://localhost:9000/dist`. So if you want to include `dist/index.min.js`  to your `demo/index.html` page, you simply have to add a script tag to `http://localhost:9000/dist/index.min.js`.



<a name="start-the-server"></a>

#### How to start the server

In your `package.json` you should have a script entry `serve` :

```jsonc
// package.json
{
	// ...
	"scripts": {
		// ...
		"serve" : "webpack serve --mode development"
	}
}
```

If so, you can run the following command in your terminal.

```sh
npm run serve
```

> To stop it, just hit CTRL + C in the terminal

