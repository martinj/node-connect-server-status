'use strict';
var http = require('http'),
	Promise = require('bluebird'),
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
		.expect(200)
		.end(function (err, res) {
			if (err) {
				return done(err);
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
		.expect(200)
		.end(function (err, res) {
			if (err) {
				return done(err);
			}
			res.body.foo.should.equal('bar');
			done();
		});
	});

	it('should append add async from options if promise returned', function (done) {
		var app = express();

		var add = function () {
			var defer = Promise.defer();
			setTimeout(function () {
				defer.resolve({ bar: 'foo' });
			}, 10);
			return defer.promise;
		};
		app.use(st(http.createServer(), { add: add }));

		request(app)
		.get('/')
		.expect(200)
		.end(function (err, res) {
			if (err) {
				return done(err);
			}
			res.body.bar.should.equal('foo');
			done();
		});
	});

	it('should fail if add promise is rejected', function (done) {
		var app = express();

		var add = function () {
			var defer = Promise.defer();
			setTimeout(function () {
				defer.reject(new Error('Crap'));
			}, 10);
			return defer.promise;
		};
		app.use(st(http.createServer(), { add: add }));

		request(app)
		.get('/')
		.expect(500, done);
	});

	it('should accept add options as function', function (done) {
		var app = express();
		app.use(st(http.createServer(), { add: function () { return { bar: 'foo' }; }}));

		request(app)
		.get('/')
		.expect(200)
		.end(function (err, res) {
			if (err) {
				return done(err);
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
		.expect(503, done);
	});

});