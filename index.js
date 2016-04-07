'use strict'

exports.resolve = resolve
exports.hash = hash

const multihashing = require('multihashing')
const base58 = require('bs58')
const jsonpointer = require('jsonpointer')
const path = require('path')

function hash (obj) {
  if (typeof obj === 'object') {
    obj = JSON.stringify(obj)
  }
  var buf = new Buffer(obj)
  return '/' + base58.encode(multihashing(buf, 'sha2-256'))
}
console.log(hash({test: 'hi'}))

/**
 * Split an absolute or relative path in two [hash, path]
 * E.g. /hashxyz/data/0 to [hashxyz, data/0]
 * E.g. ./test to ['', test]
 *
 * @method resolve
 * @param {merklePath} merklePath Merkle path
 * @param {Function} get Function that resolve the hash
 * @return {Function} callback
 */
function resolve (merklePath, get, callback) {
  if (merklePath[0] !== '/') {
    merklePath = '/' + merklePath
  }
  let sep = separe(merklePath)
  let hash = sep[0]
  let pointer = sep[1]

  follow(hash, pointer)

  function follow (hash, pointer) {
    // if hash is not an hash, then pointer may be ../
    get(hash, (err, obj) => {
      // hash was not retrieved
      if (err) {
        callback(err)
        return
      }

      if (!obj) {
        return callback()
      }

      let result = findLeaf(obj, pointer)
      let currentNode = result[0]
      let nextPointer = result[1]

      // found nothing, return
      if (!currentNode) {
        return callback()
      }

      // found a link, keep following
      let link = currentNode['@link']
      if (link) {
        let sep = separe(link)
        let nextHash = sep[0]
        let merklePath = sep[1]
        if (merklePath) {
          nextPointer = path.join(merklePath, nextPointer)
        }

        follow(nextHash, nextPointer)
        return
      }

      // found attribute/object return
      if (!nextPointer) {
        return callback(null, currentNode)
      }
    })
  }
}

/**
 * Find the node the pointer points to in the object
 * if there is an extra path and the node is a hash, returns it
 *
 * @method findLeaf
 * @param {String} obj The object we need to traverse
 * @param {String} pointer The path we need to traverse in the object
 * @return {Array} [leaf, remainderPath]
 */
function findLeaf (obj, pointer) {
  let initial = pointer

  // this can be optimized doing binary search
  while (pointer !== '/' && pointer !== '.' && pointer !== '') {
    let node = jsonpointer.get(obj, pointer)
    if (node) {
      return [node, initial.substr(pointer.length)]
    }
    pointer = path.dirname(pointer)
  }
  return [obj]
}

/**
 * Split an absolute or relative path in two [hash, path]
 * E.g. /hashxyz/data/0 to [hashxyz, data/0]
 * E.g. ./test to ['', test]
 *
 * @method separe
 * @param {String} path absolute or relative path from which we want to saparate hash from path
 * @return {Array} [hash, path]
 */
function separe (path) {
  if (path[0] !== '/') {
    return ['', path]
  }
  path = path.slice(1)

  let split = path.split('/')
  let hash = split.shift()
  let pointer = path.substr(hash.length)
  return [hash, pointer]
}
