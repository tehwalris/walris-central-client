"use strict";
var _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  proxyquire = require('proxyquire');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('client', function () {
  var Client;
  beforeEach(function () {
    Client = proxyquire('../../src/client.js', {});
  });
  it('exposes client configuration', function () {
    let config = {};
    let client = new Client(config);
    expect(client.config).to.equal(config);
  });
});
