
// node.js built-in modules
const assert = require('assert')

// npm modules
const fixtures = require('haraka-test-fixtures')

// start of tests
//    assert: https://nodejs.org/api/assert.html
//    mocha: http://mochajs.org

beforeEach(function (done) {
  this.plugin = new fixtures.plugin('template')
  done()  // if a test hangs, assure you called done()
})

describe('prometheus', function () {
  it('loads', function (done) {
    assert.ok(this.plugin)
    done()
  })
})

describe('load_prometheus_json', function () {
  it('loads prometheus.json from config/prometheus.json', function (done) {
    this.plugin.load_prometheus_json()
    assert.ok(this.plugin.cfg)
    done()
  })

  it('jsontializes enabled boolean', function (done) {
    this.plugin.load_prometheus_json()
    assert.equal(this.plugin.cfg.prometheus.enabled, true, this.plugin.cfg)
    done()
  })
})

describe('uses text fixtures', function () {
  it('sets up a connection', function (done) {
    this.connection = fixtures.connection.createConnection({})
    assert.ok(this.connection.server)
    done()
  })

  it('sets up a transaction', function (done) {
    this.connection = fixtures.connection.createConnection({})
    this.connection.transaction = fixtures.transaction.createTransaction({})
    // console.log(this.connection.transaction)
    assert.ok(this.connection.transaction.header)
    done()
  })
})