"use strict";
const queryKey = "Query";
const fetchParamsKey = "FetchParams";
const fetchResultKey = "FetchResult";
const language2LocalKey = "Language2Local";
function handleQuery(callback) {
  _addHandleByKey(queryKey, callback);
  return this;
}
function _handleQuery(pageNo, pageSize, from, lastItem) {
  const callback = _getHandleByKey(queryKey);
  return callback ? callback(pageNo, pageSize, from, lastItem) : [pageNo, pageSize, from];
}
function handleFetchParams(callback) {
  _addHandleByKey(fetchParamsKey, callback);
  return this;
}
function _handleFetchParams(parmas, extraParams) {
  const callback = _getHandleByKey(fetchParamsKey);
  return callback ? callback(parmas, extraParams || {}) : { pageNo: parmas.pageNo, pageSize: parmas.pageSize, ...extraParams || {} };
}
function handleFetchResult(callback) {
  _addHandleByKey(fetchResultKey, callback);
  return this;
}
function _handleFetchResult(result, paging, params) {
  const callback = _getHandleByKey(fetchResultKey);
  callback && callback(result, paging, params);
  return callback ? true : false;
}
function handleLanguage2Local(callback) {
  _addHandleByKey(language2LocalKey, callback);
  return this;
}
function _handleLanguage2Local(language, local) {
  const callback = _getHandleByKey(language2LocalKey);
  return callback ? callback(language, local) : local;
}
function _getApp() {
  return getApp();
}
function _hasGlobalData() {
  return _getApp() && _getApp().globalData;
}
function _addHandleByKey(key, callback) {
  try {
    setTimeout(function() {
      if (_hasGlobalData()) {
        _getApp().globalData[`zp_handle${key}Callback`] = callback;
      }
    }, 1);
  } catch (_) {
  }
}
function _getHandleByKey(key) {
  return _hasGlobalData() ? _getApp().globalData[`zp_handle${key}Callback`] : null;
}
const interceptor = {
  handleQuery,
  _handleQuery,
  handleFetchParams,
  _handleFetchParams,
  handleFetchResult,
  _handleFetchResult,
  handleLanguage2Local,
  _handleLanguage2Local
};
exports.interceptor = interceptor;
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/z-paging/components/z-paging/js/z-paging-interceptor.js.map
