var test = require('tape')
var resolve = require('../').resolve

function fake (hashes) {
  return function (hash, cb) {
    cb(null, hashes[hash])
  }
}

test('test resolve jsonpointer', function (t) {
  t.plan(4)
  var get = fake({
    hash1: {
      name: 'hello',
      family: {
        count: 4
      },
      friends: [{
        name: 'test'
      }]
    }
  })
  resolve('/hash1/name', get, (_, result) => {
    t.deepEqual(result, 'hello', 'retrieving 1-depth leaf (string)')
  })
  resolve('/hash1/family', get, (_, result) => {
    t.deepEqual(result, {count: 4}, 'retrieving 2-depth node (object)')
  })
  resolve('/hash1/family/count', get, (_, result) => {
    t.deepEqual(result, 4, 'retrieving 3-depth leaf (number)')
  })
  resolve('/hash1/friends/0/name', get, (_, result) => {
    t.deepEqual(result, 'test', 'retrieving array')
  })
})

test('test resolve links', function (t) {
  t.plan(5)
  var get = fake({
    hash1: {
      name: {
        '@link': '/hash2'
      },
      surname: {
        '@link': '/hash3/surname'
      },
      about: {
        '@link': '/hash4'
      }
    },
    hash2: 'hello',
    hash3: {surname: 'Greco'},
    hash4: {age: 22},
    hash5: {
      a: {
        '@link': '/hash6'
      }
    },
    hash6: {
      b: {
        c: {
          '@link': '/hash2'
        }
      }
    }
  })
  resolve('/hash1/name', get, (_, result) => {
    t.deepEqual(result, 'hello', 'retrieving direct link')
  })
  resolve('/hash1/surname', get, (_, result) => {
    t.deepEqual(result, 'Greco', 'retrieving direct link to leaf (hash)')
  })
  resolve('/hash1/surname', get, (_, result) => {
    t.deepEqual(result, 'Greco', 'retrieving direct link to leaf (hash/path)')
  })
  resolve('/hash1/about/age', get, (_, result) => {
    t.deepEqual(result, 22, 'retrieving direct link to node (hash/path)')
  })
  resolve('/hash5/a/b/c', get, (_, result) => {
    t.deepEqual(result, 'hello', 'retrieving complex path (hash/path)')
  })
})
