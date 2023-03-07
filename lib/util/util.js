const fs = require('fs-extra')
const path = require('path')

function writeFileTree (dir, files) {
  Object.keys(files).forEach((name) => {
    const filePath = path.join(dir, name)
    fs.ensureDirSync(path.dirname(filePath))
    fs.writeFileSync(filePath, files[name])
  })
}

function stringifyJS (value) {
    const { stringify } = require('javascript-stringify')
    // 2个空格格式化显示
    return stringify(value, null, 2)
}

function extractCallDir () {
    // extract api.render() callsite file location using error stack
    const obj = {}
    Error.captureStackTrace(obj)
    const callSite = obj.stack.split('\n')[3]
  
  
    // the regexp for the stack when called inside a named function
    const namedStackRegExp = /\s\((.*):\d+:\d+\)$/
    // the regexp for the stack when called inside an anonymous
    const anonymousStackRegExp = /at (.*):\d+:\d+$/
  
  
    let matchResult = callSite.match(namedStackRegExp)
    if (!matchResult) {
      matchResult = callSite.match(anonymousStackRegExp)
    }
  
    const fileName = matchResult[1]
    return path.dirname(fileName)
}

function mergeDeps (sourceDeps, depsToInject) {
    const result = Object.assign({}, sourceDeps)
  
    for (const depName in depsToInject) {
      const sourceRange = sourceDeps[depName]
      const injectingRange = depsToInject[depName]
  
      if (sourceRange === injectingRange) continue
  
      result[depName] = injectingRange
    }
    return result
}
  
const isObject = val => val && typeof val === 'object'


function sortObject (obj, keyOrder, dontSortByUnicode) {
    if (!obj) return
    const res = {}
  
    if (keyOrder) {
      keyOrder.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          res[key] = obj[key]
          delete obj[key]
        }
      })
    }
  
    const keys = Object.keys(obj)
  
    !dontSortByUnicode && keys.sort()
    keys.forEach(key => {
      res[key] = obj[key]
    })
  
    return res
}

module.exports = {
  writeFileTree,
  stringifyJS,
  extractCallDir,
  mergeDeps,
  isObject,
  sortObject
}