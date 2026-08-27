import { CodeSplitCompilerPlugin } from '../plugins.js';
import { Config, HmrStyle } from '../../config.js';
export declare function getFrameworkHmrCompilerPlugins(opts: {
    targetFramework: Config['target'];
    hmrStyle?: HmrStyle;
}): Array<CodeSplitCompilerPlugin> | undefined;
