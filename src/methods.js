export default {
  find: {
    method: 'get',
    instance: false,
    successCode: 200
  },
  create: {
    method: 'post',
    instance: false,
    successCode: 201
  },
  findById: {
    method: 'get',
    instance: true,
    successCode: 200
  },
  replaceById: {
    method: 'put',
    instance: true,
    successCode: 200
  },
  updateById: {
    method: 'patch',
    instance: true,
    successCode: 200
  },
  deleteById: {
    method: 'delete',
    instance: true,
    successCode: 200
  }
}
