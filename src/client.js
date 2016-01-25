"use strict";
var io = require('socket.io-client');

class Client {
  constructor (config) {
    this.config = config;
  }

  connect (url, options) {
    this._socket = io(url, options);
    let deferred = Promise.defer();
    this._socket.on('connect', () => {deferred.resolve();});
    this._socket.on('connect_error', () => {deferred.reject();});
    return deferred.promise;
  }
}

module.exports = Client;
