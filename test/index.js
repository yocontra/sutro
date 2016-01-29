/*global it: true, describe: true */
/*eslint no-console: 0*/
import should from 'should'
import sutro from '../src'
// import createModel from './fixtures/createModel'

describe('sutro', () => {
  it('should export a function', () => {
    should.exist(sutro)
    sutro.should.be.a.function
  })
})
