"use strict";
var _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  proxyquire = require('proxyquire'),
  SocketClient = require('socket-io-mocks').client;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('client', function () {
  var Client, deps, socketClient;
  beforeEach(function () {
    socketClient = new SocketClient();
    deps = {
      'socket.io-client': socketClient
    };
    Client = proxyquire('../../src/client.js', deps);
  });
  var config;
  beforeEach(function () {
    config = {
      profiles: {
        'testProfile1': {
          actions: {
            'testAction': sinon.spy()
          }
        },
        'testProfile2': {}
      }
    };
  });
  it('exposes client configuration', function () {
    let client = new Client(config);
    expect(client.config).to.equal(config);
  });
  it('passes through socket options', function () {
    let client = new Client(config),
      socketOptions = {},
      connected = client.connect('url', socketOptions);
    expect(socketClient).to.have.been.calledWith('url', socketOptions);
  });
  it('rejects promise on connection error', function () {
    let client = new Client(config),
      connected = client.connect();
    socketClient._socket._handlers.connect_error();
    return expect(connected).to.be.rejected;
  });
  describe('(successfully connected)', function () {
    var client, connected;
    beforeEach(function () {
      client = new Client(config);
      connected = client.connect();
      socketClient._socket._handlers.connect();
      return expect(connected).to.be.fulfilled;
    });
    it('registers with central on connection, passing supported profiles', function () {
      expect(socketClient._socket.emit).to.have.been.calledWithMatch('register', {
        profiles: ['testProfile1', 'testProfile2']
      });
    });
    it('runs action when requested', function () {
      let data = {};
      socketClient._socket._handlers.runAction({
        profile: 'testProfile1',
        action: 'testAction',
        data: data
      });
      expect(config.profiles.testProfile1.actions.testAction).to.have.been.calledWith(data);
    });
    describe('(crash tests)', function () {
      var sandbox;
      beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(console, "error");
      });
      afterEach(function () {
        sandbox.restore();
      });
      it('does not crash if profile is not found', function () {
        socketClient._socket._handlers.runAction({
          profile: 'saoenuhtskbbth',
          action: 'testAction',
          data: {}
        });
      });
      it('does not crash if action is not found', function () {
        socketClient._socket._handlers.runAction({
          profile: 'testProfile1',
          action: 'lckga,th,r.b',
          data: {}
        });
      });
      it('does not crash action crashes', function () {
        config.profiles.testProfile1.actions.testAction = sinon.stub().throws();
        socketClient._socket._handlers.runAction({
          profile: 'testProfile1',
          action: 'testAction'
        });
      });
    });
    it('allows undefined data paths to passed to action', function () {
      socketClient._socket._handlers.runAction({
        profile: 'testProfile1',
        action: 'testAction'
      });
      expect(config.profiles.testProfile1.actions.testAction).to.have.been.calledOnce;
    });
  });
});
