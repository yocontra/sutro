import { IRouter, Request, Response, PathParams } from 'express'
import { Stream } from 'stream'
export type Opt = { [key: string]: any }

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
  [key: string]: {
    isAuthorized: () => boolean
    execute: <T>() => Promise<T>
    format: <T>() => Promise<T> // TODO review type
    cache: {
      header: CacheOptions | (() => CacheOptions)
      key: () => string
      get: (opt: Opt, key: string) => Promise<string>
      set: (opt: Opt, data: any, key: string) => Promise<string>
    }
    http: {
      method: MethodVerbs
      instance: boolean
    }
    swagger: {}
    [key: string]: any // TODO find a better way to allow infinite nesting
  }
}

export type Resources = {
  [key: string]: ResourceRoot | Resources
}

// TODO review this typing
export type Endpoint = {
  hidden?: boolean
  path?: PathParams
  method: string
  instance?: boolean
  swagger?: any // TODO type this
  isAuthorized?: () => boolean
  execute: <T>() => Promise<T>
  format: <T>() => Promise<T>
  cache?: {
    header: CacheOptions | (() => CacheOptions)
    key: () => string
    get: (opt: Opt | string, key: string) => Promise<string>
    set: (opt: Opt | string, data: any, key: string) => Promise<string>
  }
  endpoint?: Endpoint
  successCode?: number
}

export type handlerArgs = {
  hierarchy: string
  path: PathParams
  method: MethodVerbs
  instance: boolean
  // TODO review types
  endpoint: Endpoint
}

export type Handler = (args: Endpoint) => void

export type walkResourceArgs = {
  base: string
  name: string
  resource: ResourceRoot
  hierarchy: string
  // TODO review types
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

export type getMetaArgs = {
  base: string
  resources: Resources
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
  swagger: any // TODO
  base: string
  resources: Resources
}

export type Swagger = {
  swagger: string
  info: {
    title: string
    version: string
  }
  basePath: string
  schemes: string[]
  paths: Meta // TODO verify that this is the correct type to use
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
}

export type Trace = {
  start: (name: string) => Trace
  end: () => Trace
}

export type SutroArgs = {
  base: string
  resources: Resources
  swagger?: any // TODO
  pre?: any // TODO
  post?: any // TODO
  augmentContext?: any // TODO
  trace?: Trace
}

export interface SutroRouter extends IRouter {
  swagger?: any
  meta?: any
  base?: any
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

export interface SutroRequest extends Request {
  originalMethod?: MethodVerbs
  timedout?: boolean
  user?: any // todo
  data?: any // todo
  options?: any // todo
  session?: any // todo
  noResponse?: boolean
  onFinish?: (fn: (req: SutroRequest, res: Response) => void) => void
  withRaw?: (fn: (req: SutroRequest, res: Response) => void) => void
  _req?: SutroRequest
  _res?: Response
}

export interface SutroStream extends Stream {
  contentType?: string
}

export type sendResponseArgs = {
  opt: any
  successCode?: number
  resultData: any
  writeCache: any
}
