import { CodeSplitCompilerPlugin } from '../plugins.cjs';
import { Config, HmrStyle } from '../../config.cjs';
export declare function getFrameworkHmrCompilerPlugins(opts: {
    targetFramework: Config['target'];
    hmrStyle?: HmrStyle;
}): Array<CodeSplitCompilerPlugin> | undefined;
