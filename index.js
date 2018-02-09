'use strict';


const Axios = require('axios');
const Lodash = require('lodash');
const Qs = require('qs');


////////////////////////////////////////////////////////////


/**
 * Default headers
 * @type {Object}
 */
const HEADERS = {
 'Accept': 'application/json',
}


const X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';


/**
 * Axios Data field validation.
 * @type {Array}
 */
const DATA_VALID_METHODS = ['PUT', 'POST', 'PATCH'];


/**
 * Requester Creator
 * @param {Object} objConfig Init config
 */
function Requester(objConfig={}) {
  const axios = Axios.create({
    baseURL: objConfig.host,
  });


  const INTERNAL_HEADERS = Object.assign({}, HEADERS, objConfig.headers);

  axios.defaults.headers.common['Authorization'] = objConfig.authToken;
  axios.defaults.headers.post['Content-Type'] = X_WWW_FORM_URLENCODED;


  // Add a request interceptor
  axios.interceptors.request.use(objConfig.beforeFetchFn);

  // Add a response interceptor
  axios.interceptors.response.use(objConfig.afterFetch, objConfig.onRequestError);


  /**
   * Axios Request
   * @param  {Object} objConfig      Axios Config
   * @return {Fuction}            Promise
   */
  function request(objConfig, objCustomEndpoint) {
    const objRequestPromise = axios.request(objConfig);

    if (!objCustomEndpoint.isRaw) {
      return objRequestPromise.then((objResponse) => objResponse.data);
    }

    return objRequestPromise;
  }


  /**
   * Transform endpoint replacing key params
   * @param  {Object} objCustomApi Custom api data
   * @param  {Object} objData      Request data
   * @return {Array}
   */
  function getCustomEndpoint(objCustomApi, objData) {
    let strEndpoint = objCustomApi.endpoint;
    objCustomApi.params && objCustomApi.params.forEach((strParam) => {
      strEndpoint = strEndpoint.replace(`:${strParam}`, objData[strParam]);
    });


    return strEndpoint;
  }


  /**
   * This function creates the custom api object. (Axios Config Object)
   * @param  {Object} objCustomEndpoint Custom API Config
   * @param  {Object} objSourceHeaders  Initial Headers
   * @return {Function}                   Request function
   */
  function createCustomApi(objCustomEndpoint, objSourceHeaders) {
    const objInternalHeaders = Object.assign(
      {},
      objSourceHeaders,
      objCustomEndpoint.headers
    );


    return (objData, objNewConfig={}) => {

      if (objCustomEndpoint.method == 'FORMDATA') {
        const objHeaders = Object.assign(
          {},
          objInternalHeaders,
          objNewConfig.addHeaders
        );
        return upload(objData, objHeaders, getCustomEndpoint(objCustomEndpoint, objData));
      }

      const strDataKey = Lodash.includes(DATA_VALID_METHODS, objCustomEndpoint.method.toUpperCase())
        ? 'data'
        : 'params';

      let objConfig = Object.assign(
        {
          method: objCustomEndpoint.method,
          url: getCustomEndpoint(objCustomEndpoint, objData),
          headers: Object.assign(
            {},
            objInternalHeaders,
            objNewConfig.addHeaders
          ),
          [strDataKey]: Lodash.omit(objData, objCustomEndpoint.params)
        },
        objCustomEndpoint.options,
        Lodash.omit(objNewConfig, ['addHeaders'])
      );

      const strContentType = Lodash.get(objConfig, ['headers', 'Content-Type'], false);
      if (Lodash.includes(strContentType, X_WWW_FORM_URLENCODED)) {
        objConfig.data = Qs.stringify(objConfig.data);
      }

      return request(objConfig, objCustomEndpoint);
    }
  }


  /**
   * This function transform the customs config objects to custom functions.
   * @param  {Object} objCustomEndpoint Customs endpoints config
   * @param  {Object} objSourceHeaders  Initial Headers
   * @return {Object}                   Custom endpoints functions
   */
  function getCustomEndpoints(objCustomEndpoint, objSourceHeaders) {
    return Object.keys(objCustomEndpoint).reduce((objCustomEndpoints, strKey) => {
      objCustomEndpoints[strKey] = createCustomApi(objCustomEndpoint[strKey], objSourceHeaders);
      return objCustomEndpoints;
    }, {});
  }


  /**
   * This function generates the source object with requests functions.
   * @param  {[type]} strEndpoint        Source Endpoint
   * @param  {Object} objCustomEndpoints Custom Endpoints object
   * @param  {[type]} objSourceHeaders   Custom source headers
   * @return {[type]}                    [description]
   */
  function source(strEndpoint, objCustomEndpoints={}, objSourceHeaders) {
    const objInternalHeaders = Object.assign({}, INTERNAL_HEADERS, objSourceHeaders);

    const objEndpointWithId = {
      endpoint: `${strEndpoint}/:id`,
      params: ['id']
    }

    const fnGet = createCustomApi({ method: 'GET', endpoint: strEndpoint }, objInternalHeaders);
    const fnPost = createCustomApi({ method: 'POST', endpoint: strEndpoint }, objInternalHeaders);
    const fnPut = createCustomApi(Object.assign({ method: 'PUT' }, objEndpointWithId), objInternalHeaders);
    const fnDelete = createCustomApi(Object.assign({ method: 'DELETE' }, objEndpointWithId), objInternalHeaders);


    return Object.assign(
      {
        get: fnGet,
        post: fnPost,
        update: fnPut,
        remove: fnDelete,
        // upload,
        // postForm,
      },
      getCustomEndpoints(objCustomEndpoints, objInternalHeaders)
    )
  }


  /**
   * Upload request with form data
   * @param  {Object}  objData        Post data
   * @param  {Object}  objHeaders     Headers
   * @return {Promise}
   */
  function upload(objData, objHeaders, strInternalEndPoint) {
    let objFormData = new FormData();

    //TODO: Add recursion to fields.
    //TODO: Add missing field types (Object).

    if (objData.files) {
      for (let strKey in objData.files) {
        objFormData.append(strKey, objData.files[strKey]);
        // for (let intIndex in objData.files[strKey]) {
          // objFormData.append(strKey, objData.files[strKey][intIndex]);
        // }
      }
    }

    if (objData.fields) {
      for (let strKey in objData.fields) {
        if (objData.fields[strKey]instanceof Date) {
          objFormData.append(strKey, objData.fields[strKey].toISOString());
        }

        if (Array.isArray(objData.fields[strKey])) {
          for (let intIndex in objData.fields[strKey]) {
            if (!Lodash.isNil(objData.fields[strKey][intIndex])) {
              objFormData.append(strKey, objData.fields[strKey][intIndex])
            }
          }
        } else if (!Lodash.isNil(objData.fields[strKey])) {
          objFormData.append(strKey, objData.fields[strKey])
        }
      }
    }

    const objUploadHeaders = { ...objHeaders };

    delete objUploadHeaders.Accept;

    let objRequest = {
      url: strInternalEndPoint,
      method: 'POST',
      headers: objUploadHeaders,
      data: objFormData
    };

    return request(objRequest, {});
  }


  return {
    source,
    request,
    axios
  }
}


////////////////////////////////////////////////////////////


module.exports = Requester;
