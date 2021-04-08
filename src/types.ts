import { IRouter, Request, Response } from 'express'
import { Readable } from 'stream'

export type PathParams = string | RegExp | Array<string | RegExp>

export type CacheOptions = {
  private?: boolean
  public?: boolean
  noStore?: boolean
  noCache?: boolean
  noTransform?: boolean
  proxyRevalidate?: boolean
  mustRevalidate?: boolean
  staleIfError?: number
  staleWhileRevalidate?: number
  maxAge?: number
  sMaxAge?: number
}

export type MethodKeys =
  | 'find'
  | 'create'
  | 'findById'
  | 'replaceById'
  | 'updateById'
  | 'deleteById'

export type MethodVerbs = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type Methods = {
  [key: string]: {
    method: MethodVerbs
    instance: boolean
    successCode?: number
  }
}

export type ResourceRoot = {
  hidden?: boolean
  path: PathParams
  method: string
  instance: boolean
  swagger?: SwaggerConfig
  isAuthorized?: EndpointIsAuthorized
  execute: EndpointExecute
  format?: EndpointFormat
  cache?: EndpointCache
  http: EndpointHTTP
  endpoint: ResourceRoot
  successCode?: number
  hierarchy: string
}

export type Resource = {
  [key: string]: ResourceRoot
}

export type Resources = {
  [key: string]: any // this type is recursive and not possible ATM
}

export type Handler = (args: ResourceRoot) => void

export type walkResourceArgs = {
  base?: string
  name: string
  resource: ResourceRoot
  hierarchy?: string
  handler: Handler
}

export type getPathArgs = {
  resource: string
  endpoint?: string
  instance: boolean
}

export type Paths = {
  [key: string]: {
    [key in MethodVerbs]?: SwaggerConfig
  }
}

export type MetaRoot = {
  path?: PathParams
  method?: MethodVerbs
  instance?: boolean
  [Key: string]: any
}

export type Meta = {
  [key: string]: Meta | MetaRoot
}

export type getSwaggerArgs = {
  swagger: Swagger
  base?: string
  resources: Resources
}

export type Swagger = {
  swagger?: string
  info?: {
    title?: string
    version?: string
    termsOfService?: string
    contact?: {
      name?: string
      url?: string
    }
    description?: string
  }
  basePath?: string
  schemes?: string[]
  paths?: {
    [key: string]: {
      [key: string]: SwaggerConfig
    }
  }
}

export type SwaggerConfig = {
  consumes?: string[]
  produces?: string[]
  parameters?:
    | {
        name: string
        in: string
        required: boolean
        type: string
      }[]
    | undefined
  responses?: Responses
  operationId?: string
  summary?: string
  description?: string
}

export type Trace = {
  start: (name: string) => Trace
  end: () => Trace
}

export type SutroArgs = {
  base?: string
  resources: Resources
  swagger?: Swagger
  pre?: (resource: ResourceRoot, req: Request, res: Response) => void
  post?: (
    resource: ResourceRoot,
    req: Request,
    res: Response,
    err?: any
  ) => void
  augmentContext?: (
    context: SutroRequest,
    req: Request,
    resource: ResourceRoot
  ) => Promise<SutroRequest> | SutroRequest
  serializeResponse?: (
    context: SutroRequest,
    req: Request,
    resource: ResourceRoot,
    rawData: any
  ) => void
  trace?: Trace
}

export interface SutroRouter extends IRouter {
  swagger?: Swagger
  meta?: Meta
  base?: string
}

export type ResponseStatusKeys =
  | 'default'
  | '200'
  | '201'
  | '204'
  | '401'
  | '404'
  | '500'

export type Responses = {
  [key in ResponseStatusKeys]?: {
    description: string
  }
}

// our custom express overrides
export interface ExpressRequest extends Request {
  timedout: boolean
  user?: any
  session?: any
}

// our core primitives
export interface SutroRequest {
  ip: Request['ip']
  url: Request['url']
  protocol: Request['protocol']
  method: Request['method']
  subdomains: Request['subdomains']
  path: Request['path']
  headers: Request['headers']
  cookies: Request['cookies']
  user?: any
  data?: any
  options: Request['query']
  session?: any
  noResponse?: boolean
  onFinish?: (fn: (req: Request, res: Response) => void) => void
  withRaw?: (fn: (req: Request, res: Response) => void) => void
  _req: ExpressRequest
  _res: Response
  [key: string]: any
}

export interface SutroStream extends Readable {
  contentType?: string
}

export type EndpointIsAuthorized = (
  opt: SutroRequest
) => Promise<boolean> | boolean
export type EndpointExecute = (opt: SutroRequest) => Promise<any> | any
export type EndpointFormat = (
  opt: SutroRequest,
  rawData: any
) => Promise<any> | any
export type EndpointCache = {
  header: CacheOptions | (() => CacheOptions)
  key: () => string
  get: (opt: SutroRequest | string, key: string) => Promise<any> | any
  set: (
    opt: SutroRequest | string,
    data: any,
    key: string
  ) => Promise<any> | any
}
export type EndpointHTTP = {
  method: MethodVerbs
  instance: boolean
}
