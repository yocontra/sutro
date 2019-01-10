/*global it: true, describe: true */
/*eslint no-console: 0*/
import pick from 'lodash.pick'
import should from 'should'
import sutro from '../src'
import request from 'supertest'
import express from 'express'
import Parser from 'swagger-parser'

const parser = new Parser()
const users = [
  { id: 0, name: 'foo' },
  { id: 1, name: 'bar' },
  { id: 2, name: 'baz' }
]

const passengers = [
  { name: 'todd' },
  { name: 'rob' }
]
const cars = [
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
    pre: (o, req, res, next) => {
      should.exist(o)
      should.exist(req)
      should.exist(res)
      should.exist(next)
      next()
    },
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
          execute: (opts, cb) => cb(null, { me: true }),
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

  it('should register a resource create endpoint that works with response=false', async () =>
    request(app).post('/users')
      .set('Accept', 'application/json')
      .query({ response: false })
      .expect(201)
      .expect(({ body }) => !body)
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

  it('should have a valid swagger file', async () => {
    const { body } = await request(app).get('/swagger')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    await parser.validate(body)
  })

  it('should have a meta index', async () => {
    const { body } = await request(app).get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    should(body).eql({
      'user': {
        'me': {
          'path': '/users/me',
          'method': 'get',
          'instance': false
        },
        'car': {
          'passenger': {
            'create': {
              'path': '/users/:userId/cars/:carId/passengers',
              'method': 'post',
              'instance': false
            },
            'find': {
              'path': '/users/:userId/cars/:carId/passengers',
              'method': 'get',
              'instance': false
            },
            'findById': {
              'path': '/users/:userId/cars/:carId/passengers/:passengerId',
              'method': 'get',
              'instance': true
            },
            'deleteById': {
              'path': '/users/:userId/cars/:carId/passengers/:passengerId',
              'method': 'delete',
              'instance': true
            },
            'updateById': {
              'path': '/users/:userId/cars/:carId/passengers/:passengerId',
              'method': 'patch',
              'instance': true
            },
            'replaceById': {
              'path': '/users/:userId/cars/:carId/passengers/:passengerId',
              'method': 'put',
              'instance': true
            }
          },
          'create': {
            'path': '/users/:userId/cars',
            'method': 'post',
            'instance': false
          },
          'find': {
            'path': '/users/:userId/cars',
            'method': 'get',
            'instance': false
          },
          'findById': {
            'path': '/users/:userId/cars/:carId',
            'method': 'get',
            'instance': true
          },
          'deleteById': {
            'path': '/users/:userId/cars/:carId',
            'method': 'delete',
            'instance': true
          },
          'updateById': {
            'path': '/users/:userId/cars/:carId',
            'method': 'patch',
            'instance': true
          },
          'replaceById': {
            'path': '/users/:userId/cars/:carId',
            'method': 'put',
            'instance': true
          }
        },
        'create': {
          'path': '/users',
          'method': 'post',
          'instance': false
        },
        'find': {
          'path': '/users',
          'method': 'get',
          'instance': false
        },
        'findById': {
          'path': '/users/:userId',
          'method': 'get',
          'instance': true
        },
        'deleteById': {
          'path': '/users/:userId',
          'method': 'delete',
          'instance': true
        },
        'updateById': {
          'path': '/users/:userId',
          'method': 'patch',
          'instance': true
        },
        'replaceById': {
          'path': '/users/:userId',
          'method': 'put',
          'instance': true
        }
      }
    })
  })
})

describe('sutro - async function handlers', () => {
  const config = {
    resources: {
      user: {
        create: async () => ({ created: true }),
        find: async () => users,
        findById: async (opts) => users[opts.userId],
        deleteById: async () => ({ deleted: true }),
        updateById: async () => ({ updated: true }),
        replaceById: async () => ({ replaced: true }),
        me: {
          execute: async () => ({ me: true }),
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
    pre: async (o, req, res) => {
      should.exist(o)
      should.exist(req)
      should.exist(res)
    },
    resources: {
      user: {
        create: () => ({ created: true }),
        find: () => users,
        findById: (opts) => {
          const out = users[opts.userId]
          opts.includes.forEach((i) => {
            if (i.resource !== 'cars') return
            const ls = cars[opts.userId]
            out.cars = i.attributes
              ? ls.map((c) => pick(c, i.attributes))
              : ls
          })
          return out
        },
        deleteById: () => ({ deleted: true }),
        updateById: () => ({ updated: true }),
        replaceById: () => ({ replaced: true }),
        me: {
          execute: () => ({ me: true }),
          http: {
            method: 'get',
            instance: false
          }
        },
        isCool: {
          execute: () => false,
          http: {
            method: 'get',
            instance: true
          }
        },
        nulled: {
          execute: () => null,
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

  it('should work with plain includes queries', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .query({ includes: [ 'cars' ] })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(({ body }) => {
        should.exist(body.cars)
      })
  )

  it('should work with includes queries and ignore bad ones', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .query({ includes: [ 'zzz' ] })
      .expect('Content-Type', /json/)
      .expect(200, users[1])
  )

  it('should work with attributes includes queries', async () =>
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .query({ includes: [ { resource: 'cars', attributes: [ 'name', 'id' ] } ] })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(({ body }) => {
        body.cars.forEach((c) => {
          should.equal(Object.keys(c).length, 2)
          should.exist(c.name)
          should.exist(c.id)
        })
      })
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
