"use strict";
var _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  proxyquire = require('proxyquire'),
  SocketClientMock = require('../mocks/socket.io-client.js');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('client', function () {
  var Client, deps, socketMock;
  beforeEach(function () {
    socketMock = new SocketClientMock();
    deps = {
      'socket.io-client': socketMock.constructorStub
    };
    Client = proxyquire('../../src/client.js', deps);
  });
  it('exposes client configuration', function () {
    let config = {};
    let client = new Client(config);
    expect(client.config).to.equal(config);
  });
  it('passes through socket options', function () {
    let client = new Client({}),
      socketOptions = {},
      connected = client.connect('url', socketOptions);
    expect(socketMock.constructorStub).to.have.been.calledWith('url', socketOptions);
  });
  it('rejects promise on connection error', function () {
    let client = new Client({}),
      connected = client.connect();
    socketMock.socket._handlers.connect_error();
    return expect(connected).to.be.rejected;
  });
  it('registers with central on connection, passing the whole config', function () {
    let config = {};
    let client = new Client(config),
      connected = client.connect();
    socketMock.socket._handlers.connect();
    return expect(connected).to.be.fulfilled.then(() => {
      expect(socketMock.socket.emit).to.have.been.calledWith('register', config);
    });
  });
});
