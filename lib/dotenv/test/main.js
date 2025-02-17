'use strict'

require('should')
var sinon = require('sinon')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var describe = lab.experiment
var before = lab.before
var beforeEach = lab.beforeEach
var afterEach = lab.afterEach
var it = lab.test
var fs = require('fs')
var dotenv = require('../lib/main')
var s

describe('dotenv', function () {
  beforeEach(function (done) {
    s = sinon.sandbox.create()
    done()
  })

  afterEach(function (done) {
    s.restore()
    done()
  })

  describe('config', function () {
    var readFileSyncStub, parseStub

    beforeEach(function (done) {
      readFileSyncStub = s.stub(fs, 'readFileSync').returns('test=val')
      parseStub = s.stub(dotenv, 'parse').returns({test: 'val'})
      done()
    })

    it('takes option for path', function (done) {
      var testPath = 'test/.env'
      dotenv.config({path: testPath})

      readFileSyncStub.args[0][0].should.eql(testPath)
      done()
    })

    it('takes option for encoding', function (done) {
      var testEncoding = 'base64'
      dotenv.config({encoding: testEncoding})

      readFileSyncStub.args[0][1].should.have.property('encoding', testEncoding)
      done()
    })

    it('reads path with encoding, parsing output to process.env', function (done) {
      dotenv.config()

      readFileSyncStub.callCount.should.eql(1)
      parseStub.callCount.should.eql(1)
      done()
    })

    it('makes load a synonym of config', function (done) {
      dotenv.load()

      readFileSyncStub.callCount.should.eql(1)
      parseStub.callCount.should.eql(1)
      done()
    })

    it('does not write over keys already in process.env', function (done) {
      process.env.test = 'test'
      // 'val' returned as value in `beforeEach`. should keep this 'test'
      dotenv.config()

      process.env.test.should.eql('test')
      done()
    })

    it('catches any errors thrown from reading file or parsing', function (done) {
      var errorStub = s.stub(console, 'error')
      readFileSyncStub.throws()

      dotenv.config().should.eql(false)
      errorStub.callCount.should.eql(1)
      done()
    })

    it('takes option for silencing errors', function (done) {
      var errorStub = s.stub(console, 'error')
      readFileSyncStub.throws()

      dotenv.config({silent: true}).should.eql(false)
      errorStub.called.should.be.false
      done()
    })
  })

  describe('parse', function () {
    var parsed
    before(function (done) {
      process.env.TEST = 'test'
      parsed = dotenv.parse(fs.readFileSync('test/.env', {encoding: 'utf8'}))
      done()
    })

    it('should return an object', function (done) {
      parsed.should.be.an.instanceOf(Object)
      done()
    })

    it('should parse a buffer from a file into an object', function (done) {
      var buffer = new Buffer('BASIC=basic')

      var payload = dotenv.parse(buffer)
      payload.should.have.property('BASIC', 'basic')
      done()
    })

    it('sets basic environment variable', function (done) {
      parsed.BASIC.should.eql('basic')
      done()
    })

    it('reads after a skipped line', function (done) {
      parsed.AFTER_LINE.should.eql('after_line')
      done()
    })

    it('defaults empty values to empty string', function (done) {
      parsed.EMPTY.should.eql('')
      done()
    })

    it('escapes double quoted values', function (done) {
      parsed.DOUBLE_QUOTES.should.eql('double_quotes')
      done()
    })

    it('escapes single quoted values', function (done) {
      parsed.SINGLE_QUOTES.should.eql('single_quotes')
      done()
    })

    it('expands newlines but only if double quoted', function (done) {
      parsed.EXPAND_NEWLINES.should.eql('expand\nnewlines')
      parsed.DONT_EXPAND_NEWLINES_1.should.eql('dontexpand\\nnewlines')
      parsed.DONT_EXPAND_NEWLINES_2.should.eql('dontexpand\\nnewlines')
      done()
    })

    it('ignores commented lines', function (done) {
      parsed.should.not.have.property('COMMENTS')
      done()
    })

    it('ignores comments at the end of lines', function (done) {
      parsed.EOL_COMMENTS.should.eql('good')
      done()
    })

    it('respects comment-lookalikes if quoted', function (done) {
      parsed.QUOTED_HASH_1.should.eql('should be # included')
      parsed.QUOTED_HASH_2.should.eql('should be # included')
      done()
    })

    it('respects equals signs in values', function (done) {
      parsed.EQUAL_SIGNS.should.eql('equals==')
      done()
    })

    it('retains inner quotes', function (done) {
      parsed.RETAIN_INNER_QUOTES.should.eql('{\"foo\": \"bar\"}')
      parsed.RETAIN_INNER_QUOTES_AS_STRING.should.eql('{\"foo\": \"bar\"}')
      done()
    })

    it('retains spaces in string', function (done) {
      parsed.INCLUDE_SPACE.should.eql('some spaced out string')
      done()
    })

    it('trims leading/trailing whitespace', function (done) {
      parsed.WHITESPACE_TRIM.should.eql('trim me')
      done()
    })

    it('retains quoted leading/trailing whitespace', function (done) {
      parsed.QUOTED_WHITESPACE_NOTRIM_1.should.eql('  dont trim me   ')
      parsed.QUOTED_WHITESPACE_NOTRIM_2.should.eql('  dont trim me   ')
      done()
    })

    it('parses email addresses completely', function (done) {
      parsed.should.have.property('USERNAME', 'therealnerdybeast@example.tld')
      done()
    })

    it('handles severe combinations of the above', function (done) {
      parsed.PARSER_QA_1.should.eql("a'b'c'd'e")
      parsed.PARSER_QA_2.should.eql('"  mismatched\\nquotes  \'')
      parsed.PARSER_QA_3.should.eql('  # yes\n  # yes\n')
      done()
    })
  })
})
