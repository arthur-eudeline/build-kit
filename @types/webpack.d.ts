import {Configuration, RuleSetRule, WebpackPluginInstance} from "webpack";


export type WebpackModuleRule = RuleSetRule & { name: string };

export type WebpackModuleRules = Record<'javaScript' | 'css' | 'font' | 'images' | 'icons', WebpackModuleRule>;

export type WebpackPlugin = WebpackPluginInstance;

export type WebpackPluginInitializer<T = object> = {
  options?: T,
  init: ((options?:T) => WebpackPlugin)
};

export interface WebpackConfiguration extends Configuration {
  module: { rules : WebpackModuleRule[] }
}
