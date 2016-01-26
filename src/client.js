"use strict";
var io = require('socket.io-client'),
  _ = require('lodash');

class Client {
  constructor (config) {
    this.config = config;
  }

  connect (url, options) {
    return this._connect(url, options).then(() => {
      this._configureSocket();
      return this._register();
    });
  }

  _connect (url, options) {
    this._socket = io(url, options);
    let deferred = Promise.defer();
    this._socket.on('connect', () => {deferred.resolve();});
    this._socket.on('connect_error', () => {deferred.reject();});
    return deferred.promise;
  }

  _configureSocket () {
    this._socket.on('runAction', this._runAction.bind(this));
  }

  _register () {
    this._socket.emit('register', {
      profiles: _.keys(this.config.profiles)
    });
  }

  _runAction (options) {
    try {
      this.config.profiles[options.profile].actions[options.action](options.data);
    } catch (e) {
      console.error('Failed to run action', options);
      console.error(e.stack);
    }
  }
}

module.exports = Client;
