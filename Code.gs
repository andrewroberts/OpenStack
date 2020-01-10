// 34567890123456789012345678901234567890123456789012345678901234567890123456789

/**
 * @fileOverview GAS Library for accessing an <a href="http://developer.openstack.org/api-ref.html">OpenStack API</a>. Library ID Mo6MqgzKidu5VYzZ7NzIM-tnfWGfgtIUb
 * @author <a href="mailto:andrew@roberts.net">Andrew Roberts</a>
 * @copyright <a href="http://www.andrewroberts.net">Andrew Roberts</a>
 */

/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later 
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with 
 * this program. If not, see http://www.gnu.org/licenses/.
 */

// JSHint - April 10 2015 18:14 GMT+1
/* jshint asi: true */

// OpenStack.gs
// ============

// Public Functions
// ----------------

/**
 * Connect to Memset's OpenStack API
 *
 * @param {string} rootUrl 
 * @param {string} tenant 
 * @param {string} username
 * @param {string} password
 *
 * @return {object}:
 *   {string} authToken
 *   {string} endpoint
 */
 
function connect(rootUrl, tenant, username, password) {
  
  var functionName = 'OpenStack.connect()'
  
  assertStringNotEmpty_(
    tenant, 
    'You must specify a tenant in call to ' + functionName)
    
  assertStringNotEmpty_(
    username, 
    'You must specify a username in call to ' + functionName)
    
  assertStringNotEmpty_(
    password, 
    'You must specify a password in call to ' + functionName)

  var payload = {
    auth: {
      tenantName: tenant, 
      passwordCredentials: {
        username: username, 
        password: password
      }
    }
  }
  
  var options = {
    contentType: 'application/json',
    method: 'post',
    muteHttpExceptions: false,        
    payload: JSON.stringify(payload),
  }
  
  var jsonResponse = UrlFetchApp.fetch(rootUrl + 'tokens', options)
  
  // Assume error thrown if call fails
  var response = JSON.parse(jsonResponse)
  var authToken = response.access.token.id
  var endpoint = response.access.serviceCatalog[0].endpoints[0].publicURL
  
  return {
    
    authToken: authToken,
    endpoint: endpoint
  }
  
} // OpenStack.connect()

/**
 * Get the headers for a file
 *
 * @param {object} authTokenData 
 * @param {string} path 
 *
 * @return {object} headers
 */

function getHeaders(authTokenData, path) {
  
  var authToken = authTokenData.authToken
  var endpoint = authTokenData.endpoint
  
  var options = {
    type: 'head',
    headers: {
      'X-Auth-Token': authToken,
      'Range': 'bytes=0-0',
    },
    muteHttpExceptions: false, 
  }
  
  return UrlFetchApp.fetch(endpoint + path, options).getAllHeaders()
    
} // OpenStack.getHeaders()

/**
 * Send a GET request to Memset's OpenStack API 
 *
 * @param {object}:
 *   {string} authToken
 *   (string) endpoint
 * @param {string} path File path
 * @param {string} range Range of bytes to get, e.g. "bytes=0-19" for first 20 (OPTIONAL, DEFAULT: all bytes)
 *
 * @return {string} file contents
 */
  
function get(authTokenData, path, range){
  
  assertStringNotEmpty_(
    authTokenData.authToken, 
    'No auth token in call to OpenStack.get()')
    
  assertStringNotEmpty_(
    authTokenData.authToken, 
    'No endpoint in call to OpenStack.get()')

  assertStringNotEmpty_(
    path, 
    'No path in call to OpenStack.get()')

  var authToken = authTokenData.authToken
  var endpoint = authTokenData.endpoint
  
  var options = {
    headers: {
      "X-Auth-Token": authToken
    },
    muteHttpExceptions: false, 
  }
  
  if (typeof range !== 'undefined') {
    options.headers["Range"] = range
  }

  var response = UrlFetchApp.fetch(endpoint + path, options)
  
  return response.getContentText()
  
} // OpenStack.get()

// Private Functions
// -----------------

/**
 * Assert a value is a string
 *
 * @param {object} testValue The value to test
 * @param {string} errorMessage The error message to throw 
 */

function assertStringNotEmpty_(testValue, errorMessage) {

  if (typeof testValue !== 'string' && testValue !== '') {
  
    throw new TypeError(errorMessage)
  }
  
} // assertStringNotEmpty_()
