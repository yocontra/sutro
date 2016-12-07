/*global it: true, describe: true */
/*eslint no-console: 0*/
import should from 'should'
import sutro from '../src'
import request from 'supertest'
import express from 'express'

let users = [ {
  id: 0,
  name: 'foo'
}, {
  id: 1,
  name: 'bar'
}, {
  id: 2,
  name: 'baz'
} ]

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
        find: (opts, cb) => cb(null, JSON.stringify(users)),
        findById: (opts, cb) => cb(null, users[opts.id]),
        deleteById: (opts, cb) => cb(null, { deleted: true }),
        updateById: (opts, cb) => cb(null, { updated: true }),
        replaceById: (opts, cb) => cb(null, { replaced: true }),
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

  it('should register a resource find endpoint', (done) => {
    request(app).get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })

  it('should register a resource findById endpoint', (done) => {
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1], done)
  })


  it('should register a resource create endpoint', (done) => {
    request(app).post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }, done)
  })

  it('should register a resource delete endpoint', (done) => {
    request(app).delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }, done)
  })

  it('should register a resource replace endpoint', (done) => {
    request(app).put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }, done)
  })

  it('should register a resource update endpoint', (done) => {
    request(app).patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }, done)
  })

  it('should register a custom resource', (done) => {
    request(app).get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true }, done)
  })
})

describe('sutro - async function handlers', () => {
  const config = {
    resources: {
      user: {
        create: async () => await { created: true },
        find: async () => await JSON.stringify(users),
        findById: async (opts) => await users[opts.id],
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

  it('should register a resource find endpoint', (done) => {
    request(app).get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })

  it('should register a resource findById endpoint', (done) => {
    request(app).get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1], done)
  })


  it('should register a resource create endpoint', (done) => {
    request(app).post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }, done)
  })

  it('should register a resource delete endpoint', (done) => {
    request(app).delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }, done)
  })

  it('should register a resource replace endpoint', (done) => {
    request(app).put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }, done)
  })

  it('should register a resource update endpoint', (done) => {
    request(app).patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }, done)
  })

  it('should register a custom resource', (done) => {
    request(app).get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true }, done)
  })
})
