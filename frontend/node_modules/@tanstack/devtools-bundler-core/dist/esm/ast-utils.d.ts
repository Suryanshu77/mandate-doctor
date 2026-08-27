import { Node } from 'oxc-parser';
/**
 * Iterate over the direct child nodes of an AST node.
 * Uses a per-type cache of which keys hold child nodes to avoid
 * allocating Object.entries() arrays on every call.
 */
export declare function forEachChild(node: Node, callback: (child: Node) => void): void;
/**
 * Recursively walk AST nodes, calling `visitor` for each node with a `type`.
 */
export declare function walk(node: Node, visitor: (node: Node, parentNode?: Node) => void, parentNode?: Node): void;
