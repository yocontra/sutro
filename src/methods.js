export default {
  find: {
    method: 'get',
    instance: false,
    emptyCode: 204,
    successCode: 200
  },
  create: {
    method: 'post',
    instance: false,
    emptyCode: 204,
    successCode: 201
  },
  findById: {
    method: 'get',
    instance: true,
    emptyCode: 404,
    successCode: 200
  },
  replaceById: {
    method: 'put',
    instance: true,
    emptyCode: 204,
    successCode: 200
  },
  updateById: {
    method: 'patch',
    instance: true,
    emptyCode: 204,
    successCode: 200
  },
  deleteById: {
    method: 'delete',
    instance: true,
    emptyCode: 204,
    successCode: 200
  }
}
