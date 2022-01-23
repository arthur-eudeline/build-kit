import {WebpackConfigBuilder as _WebpackConfigBuilder} from "./lib/builders/webpack-config-builder";
import {
  WebpackCleaningAssetsKeepingBuildsPlugin as _WebpackCleaningAssetsKeepingBuildsPlugin
} from "./lib/webpack/plugins/webpack-cleaning-assets-keeping-builds-plugin";


export const WebpackConfigBuilder = () => new _WebpackConfigBuilder();
export const WebpackCleaningAssetsKeepingBuildsPlugin = _WebpackCleaningAssetsKeepingBuildsPlugin;

