const test = require('tape')
var config = require('config')
var geom = config.gcloud.geometry

test('Test port set to default', function (t) {
  t.plan(1)
  t.equal(geom, 'shape')
})
