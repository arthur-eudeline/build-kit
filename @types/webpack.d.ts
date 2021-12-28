import {Configuration, RuleSetRule} from "webpack";


export type WebpackModuleRule = RuleSetRule & { name: string };

export type WebpackModuleRules = Record<'javaScript' | 'css' | 'font' | 'images' | 'icons', WebpackModuleRule>;

export interface WebpackConfiguration extends Configuration {
  module: { rules : WebpackModuleRule[] }
}
