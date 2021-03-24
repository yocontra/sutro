import { IRouter, Request, Response } from 'express'
import { Stream } from 'stream'
export type Opt = { [key: string]: any }

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
  path?: PathParams
  method: string
  instance?: boolean
  swagger?: any // TODO type this
  isAuthorized?: () => Promise<boolean>
  execute: <T>() => Promise<T>
  format: <T>() => Promise<T>
  cache?: {
    header: CacheOptions | (() => CacheOptions)
    key: () => string
    get: <T>(opt: Opt | string, key: string) => Promise<T>
    set: <T>(opt: Opt | string, data: any, key: string) => Promise<T>
  }
  http: {
    method: MethodVerbs
    instance: boolean
  }
  endpoint?: ResourceRoot
  successCode?: number
  hierarchy?: string
}

export type Resource = {
  [key: string]: ResourceRoot
}

export type Resources = {
  [key: string]: Resource
}

export type Handler = (args: ResourceRoot) => void

export type walkResourceArgs = {
  base?: string
  name: string
  resource: Resource
  hierarchy?: string
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
  pre?: <T>(
    resource: ResourceRoot,
    req: SutroRequest,
    res: Response
  ) => Promise<T> // TODO verify this is correct
  post?: <T>() => Promise<T> // TODO
  augmentContext?: (context: Opt, req: SutroRequest) => Opt // TODO
  trace?: Trace
}

export interface SutroRouter extends IRouter {
  swagger?: any // TODO
  meta?: any // TODO
  base?: any // TODO
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
