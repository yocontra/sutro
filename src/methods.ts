export type MethodKeys =
  | 'find'
  | 'create'
  | 'findById'
  | 'replaceById'
  | 'updateById'
  | 'deleteById'
export type MethodVerbs = 'get' | 'post' | 'put' | 'patch' | 'delete'
export type Methods = {
  [key in MethodKeys]: {
    method: MethodVerbs
    instance: boolean
    successCode?: number
  }
}

const methods: Methods = {
  find: {
    method: 'get',
    instance: false
  },
  create: {
    method: 'post',
    instance: false,
    successCode: 201
  },
  findById: {
    method: 'get',
    instance: true
  },
  replaceById: {
    method: 'put',
    instance: true
  },
  updateById: {
    method: 'patch',
    instance: true
  },
  deleteById: {
    method: 'delete',
    instance: true
  }
}

export default methods
