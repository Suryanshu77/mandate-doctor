import { AWSLambdaContext, AWSLambdaProxyEvent, AWSLambdaProxyEventV2, AWSLambdaProxyResult, AWSLambdaProxyResultV2, FetchHandler, ServerOptions, TrustProxyOption } from "../_chunks/types.mjs";
type AWSLambdaResponseStream = NodeJS.WritableStream & {
  setContentType(contentType: string): void;
};
type MaybePromise<T> = T | Promise<T>;
type AwsLambdaEvent = AWSLambdaProxyEvent | AWSLambdaProxyEventV2;
type AWSLambdaHandler = (event: AwsLambdaEvent, context: AWSLambdaContext) => MaybePromise<AWSLambdaProxyResult | AWSLambdaProxyResultV2>;
type AWSLambdaStreamingHandler = (event: AwsLambdaEvent, responseStream: AWSLambdaResponseStream, context: AWSLambdaContext) => MaybePromise<void>;
declare function toLambdaHandler(options: ServerOptions): AWSLambdaHandler;
declare function handleLambdaEvent(fetchHandler: FetchHandler, event: AwsLambdaEvent, context: AWSLambdaContext, trustProxy?: TrustProxyOption): Promise<AWSLambdaProxyResult | AWSLambdaProxyResultV2>;
declare function handleLambdaEventWithStream(fetchHandler: FetchHandler, event: AwsLambdaEvent, responseStream: AWSLambdaResponseStream, context: AWSLambdaContext, trustProxy?: TrustProxyOption): Promise<void>;
declare function invokeLambdaHandler(handler: AWSLambdaHandler, request: Request): Promise<Response>;
export { AWSLambdaHandler, type AWSLambdaResponseStream, AWSLambdaStreamingHandler, AwsLambdaEvent, handleLambdaEvent, handleLambdaEventWithStream, invokeLambdaHandler, toLambdaHandler };