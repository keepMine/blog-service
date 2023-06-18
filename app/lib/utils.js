// 数组去重
function unique(arr) {
  return [...new Set(arr)]
}

// 检测是否是数组
function isArray(arr) {
  return Array.isArray(arr)
}

module.exports = {

  isArray,
  unique,

}