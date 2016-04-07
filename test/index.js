/*global it: true, describe: true */
/*eslint no-console: 0*/
import should from 'should'
import sutro from '../src'
import request from 'supertest'
import express from 'express'

// import createModel from './fixtures/createModel'
//
// let User = createModel('user', {
//   id: String,
//   name: String
// })

let users = [ {
  id: 1,
  name: 'foo'
}, {
  id: 2,
  name: 'bar'
}, {
  id: 3,
  name: 'baz'
} ]

describe('sutro', () => {
  it('should export a function', () => {
    should.exist(sutro)
    sutro.should.be.a.function
  })
})

describe('sutro - function handlers', () => {
  const config = {
    resources: {
      user: {
        create: (opts, cb) => cb(null, { created: true }),
        find: (opts, cb) => cb(null, JSON.stringify(users)),
        findById: (opts, cb) => cb(null, users[opts.id - 1]),
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

  it('should register a resource query endpoint', (done) => {
    request(app).get('/users')
      .expect(200, done)
  })

  it('should register a resource find endpoint', (done) => {
    request(app).get('/users/1')
      .expect(200, users[0])

    request(app).get('/users/2')
      .expect(200, users[1], done)
  })


  it('should register a resource creation endpoint', (done) => {
    request(app).post('/users')
      .expect(201, { created: true }, done)
  })

  it('should register a resource deletion endpoint', (done) => {
    request(app).delete('/users/1')
      .expect(200, { deleted: true }, done)
  })

  it('should register a resource replace endpoint', (done) => {
    request(app).put('/users/1')
      .expect(200, { replaced: true }, done)
  })

  it('should register a resource update endpoint', (done) => {
    request(app).patch('/users/1')
      .expect(200, { updated: true }, done)
  })

  it('should register a custom resource', (done) => {
    request(app).get('/users/me')
      .expect(200, { me: true }, done)
  })
})
