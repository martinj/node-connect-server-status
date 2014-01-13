'use strict';
var http = require('http'),
	request = require('supertest'),
	st = require('../'),
	express = require('express');

require('should');
describe('Server Status MiddleWare', function () {
	it('should return status', function (done) {
		var app = express();
		app.use(st(http.createServer()));

		request(app)
		.get('/')
		.end(function (err, res) {
			if (err) {
				throw err;
			}
			res.body.should.have.properties(['pid', 'uptime', 'memory', 'connections']);
			done();
		});
	});

	it('should append add from options', function (done) {
		var app = express();
		app.use(st(http.createServer(), { add: { foo: 'bar' }}));

		request(app)
		.get('/')
		.end(function (err, res) {
			if (err) {
				throw err;
			}
			res.body.foo.should.equal('bar');
			done();
		});
	});

	it('should accept add options as function', function (done) {
		var app = express();
		app.use(st(http.createServer(), { add: function () { return { bar: 'foo' }; }}));

		request(app)
		.get('/')
		.end(function (err, res) {
			if (err) {
				throw err;
			}
			res.body.bar.should.equal('foo');
			done();
		});
	});

	it('should return 503 if maintenance file exists', function (done) {
		var app = express();
		app.use(st(http.createServer(), { maintenance: __dirname + '/index.test.js' }));

		request(app)
		.get('/')
		.end(function (err, res) {
			if (err) {
				throw err;
			}
			res.statusCode.should.equal(503);
			done();
		});
	});

});