'use strict';
var Promise = require('bluebird'),
	http = require('http'),
	fs = require('fs');

/**
 * Extend object
 * @param  {Object} obj
 * @param {Object} ..
 * @return {Object} extended object
 */
function extend(obj) {
	Array.prototype.slice.call(arguments, 1).forEach(function (source) {
		for (var prop in source) {
			obj[prop] = source[prop];
		}
	});
	return obj;
}

/**
 * Get concurrent connections from a HTTP server
 * @param  {HTTPServer} server
 * @return {Promise}	Resolves with {type: connections}
 */
function getConnections(server) {
	return new Promise(function (resolve, reject) {

		server.getConnections(function (err, concurrentConnections) {
			if (err) {
				return reject(new Error('Unable to fetch connection status for server: ' + err.message));
			}

			var r = {};
			r[server instanceof http.Server ? 'http' : 'https'] = concurrentConnections;
			resolve(r);
		});

	});
}

/**
 * Get status data
 * @param  {Array} servers list with servers
 * @param  {Object|Function} add append this to status
 * @return {Promise} resolves with status object
 */
function status(servers, add) {
	add = typeof(add) === 'function' ? add() : add;

	return Promise.all(servers.map(function (srv) {
		return getConnections(srv);
	})).then(function (results) {
		var connections = { total: 0 };
		results.forEach(function (res) {
			var k = Object.keys(res)[0];
			connections.total += res[k];
			connections[k] = res[k];
		});

		return Promise.props({
			connections: connections,
			add: add
		});
	}).then(function (data) {
		return extend({
			pid: process.pid,
			connections: data.connections,
			memory: process.memoryUsage(),
			uptime: process.uptime()
		}, data.add);
	});
}

/**
 * Status Connect Middleware
 * @param  {Array|http.Server|http.Servers} servers either a server or an array of servers
 * @param  {Object} [opts] options
 * @param {String} [opts.maintenance] path to maintenance file for enabling maintenance check on status requests.
 *                                    Returns status code 503 service unavailable when in maintenance
 * @param {Object|Function} [opts.add] properties to add to the status output.
 * @return {Function}
 */
module.exports = function (servers, opts) {
	opts = opts || {};
	servers = servers instanceof Array ? servers : [servers];
	return function (req, res, next) {
		var sendStatus = function () {
			status(servers, opts.add || {}).then(function (status) {
				res.json(status);
			}).catch(function (err) {
				next(err);
			});
		};

		if (opts.maintenance) {
			fs.exists(opts.maintenance, function (exists) {
				if (exists) {
					return res.sendStatus(503);
				}
				sendStatus();
			});
		} else {
			sendStatus();
		}
	};
};
