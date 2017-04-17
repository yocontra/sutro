/*global it: true, describe: true */
/*eslint no-console: 0*/
import should from 'should'
import sutro from '../src'
import request from 'supertest'
import express from 'express'

let users = [
  { id: 0, name: 'foo' },
  { id: 1, name: 'bar' },
  { id: 2, name: 'baz' }
]

let passengers = [
  { name: 'todd' },
  { name: 'rob' }
]
let cars = [
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ],
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ],
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ]
]

describe('sutro', () => {
  it('should export a function', () => {
    should.exist(sutro)
    sutro.should.be.a.function
  })
  it('should return a router', () => {
    const router = sutro({ resources: {} })
    should.exist(router)
    router.should.be.a.function
  })
  it('should error if missing resources', () => {
    sutro.should.throw()
    sutro.bind(null, {}).should.throw()
  })
})

describe('sutro - function handlers', () => {
  const config = {
    resources: {
      user: {
        create: (opts, cb) => cb(null, { created: true }),
        find: (opts, cb) => cb(null, users),
        findById: (opts, cb) => cb(null, users[opts.userId]),
        deleteById: (opts, cb) => cb(null, { deleted: true }),
        updateById: (opts, cb) => cb(null, { updated: true }),
        replaceById: (opts, cb) => cb(null, { replaced: true }),
        car: {
          create: (opts, cb) => cb(null, { created: true }),
          find: (opts, cb) => cb(null, cars[opts.userId]),
          findById: (opts, cb) => cb(null, cars[opts.userId][opts.carId]),
          deleteById: (opts, cb) => cb(null, { deleted: true }),
          updateById: (opts, cb) => cb(null, { updated: true }),
          replaceById: (opts, cb) => cb(null, { replaced: true }),

          passenger: {
            create: (opts, cb) => cb(null, { created: true }),
            find: (opts, cb) => cb(null, cars[opts.userId][opts.carId].passengers),
            findById: (opts, cb) => cb(null, cars[opts.userId][opts.carId].passengers[opts.passengerId]),
            deleteById: (opts, cb) => cb(null, { deleted: true }),
            updateById: (opts, cb) => cb(null, { updated: true }),
            replaceById: (opts, cb) => cb(null, { replaced: true })
          }
        },
        me: {
          process: (opts, cb) => cb(null, { me: true }),
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app).get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users)
  )

  it('should register a resource findById endpoint', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1])
  )


  it('should register a resource create endpoint', async () =>
    request(app).post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true })
  )

  it('should register a resource delete endpoint', async () =>
    request(app).delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true })
  )

  it('should register a resource replace endpoint', async () =>
    request(app).put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true })
  )

  it('should register a resource update endpoint', async () =>
    request(app).patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true })
  )

  it('should register a custom resource', async () =>
    await request(app).get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true })
  )

  it('should register a nested resource find endpoint', async () =>
    request(app).get('/users/1/cars')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1])
  )

  it('should register a nested resource findById endpoint', async () =>
    request(app).get('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1])
  )


  it('should register a nested resource create endpoint', async () =>
    request(app).post('/users/1/cars')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true })
  )

  it('should register a nested resource delete endpoint', async () =>
    request(app).delete('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true })
  )

  it('should register a nested resource replace endpoint', async () =>
    request(app).put('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true })
  )

  it('should register a nested resource update endpoint', async () =>
    request(app).patch('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true })
  )
  it('should register a double nested resource find endpoint', async () =>
    request(app).get('/users/1/cars/1/passengers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1].passengers)
  )

  it('should register a double nested resource findById endpoint', async () =>
    request(app).get('/users/1/cars/1/passengers/0')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1].passengers[0])
  )


  it('should register a double nested resource create endpoint', async () =>
    request(app).post('/users/1/cars/1/passengers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true })
  )

  it('should register a double nested resource delete endpoint', async () =>
    request(app).delete('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true })
  )

  it('should register a double nested resource replace endpoint', async () =>
    request(app).put('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true })
  )

  it('should register a double nested resource update endpoint', async () =>
    request(app).patch('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true })
  )

  it('should have a swagger.json', async () => {
    const { body } = await request(app).get('/swagger.json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    console.log(JSON.stringify(body, null, 2))
  })
})

describe('sutro - async function handlers', () => {
  const config = {
    resources: {
      user: {
        create: async () => await { created: true },
        find: async () => await users,
        findById: async (opts) => await users[opts.userId],
        deleteById: async () => await { deleted: true },
        updateById: async () => await { updated: true },
        replaceById: async () => await { replaced: true },
        me: {
          process: async () => await { me: true },
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app).get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users)
  )

  it('should register a resource findById endpoint', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1])
  )


  it('should register a resource create endpoint', async () =>
    request(app).post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true })
  )

  it('should register a resource delete endpoint', async () =>
    request(app).delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true })
  )

  it('should register a resource replace endpoint', async () =>
    request(app).put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true })
  )

  it('should register a resource update endpoint', async () =>
    request(app).patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true })
  )

  it('should register a custom resource', async () =>
    request(app).get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true })
  )
})

describe('sutro - flat value handlers', () => {
  const config = {
    resources: {
      user: {
        create: () => ({ created: true }),
        find: () => users,
        findById: (opts) => users[opts.userId],
        deleteById: () => ({ deleted: true }),
        updateById: () => ({ updated: true }),
        replaceById: () => ({ replaced: true }),
        me: {
          process: () => ({ me: true }),
          http: {
            method: 'get',
            instance: false
          }
        },
        isCool: {
          process: () => false,
          http: {
            method: 'get',
            instance: true
          }
        },
        nulled: {
          process: () => null,
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app).get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users)
  )

  it('should register a resource findById endpoint', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1])
  )


  it('should register a resource create endpoint', async () =>
    request(app).post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true })
  )

  it('should register a resource delete endpoint', async () =>
    request(app).delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true })
  )

  it('should register a resource replace endpoint', async () =>
    request(app).put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true })
  )

  it('should register a resource update endpoint', async () =>
    request(app).patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true })
  )

  it('should register a custom resource', async () =>
    request(app).get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true })
  )

  it('should return 200 with data from a custom falsey resource', async () =>
    request(app).get('/users/123/isCool')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, 'false')
  )

  it('should return 404 from a custom null resource', async () =>
    request(app).get('/users/nulled')
      .set('Accept', 'application/json')
      .expect(404)
  )
})
