# connect-server-status

Connect middleware for showing a status page including maintenance mode.

[![Build Status](https://secure.travis-ci.org/martinj/node-connect-server-status.png)](http://travis-ci.org/martinj/node-connect-server-status)

## Installation

	npm install connect-server-status

## Examples

	var status = require('connect-server-status'),
		http = require('http'),
		app = require('express')(),
		server = http.createServer(app);

	app.get('/status', status(server, {
		maintenance: __dirname + './maintenance',
		add: { version: "0.1.0" }
	}));

	server.listen(3000);

### Options

	/**
	 * Status Connect Middleware
	 * @param  {Array|http.Server|http.Servers} servers either a server or an array of servers
	 * @param  {Object} [opts] options
	 * @param {String} [opts.maintenance] path to maintenance file for enabling maintenance check on status requests.
	 *                                    Returns status code 503 service unavailable when in maintenance
	 * @param {Object|Function} [opts.add] properties to add to the status output, for async function return a promise
	 * @return {Function}
	 */
	module.exports = function (servers, opts) {

## Output

	curl http://localhost:3000/status

	{
	  "pid": 4675,
	  "connections": {
	    "total": 1,
	    "http": 1
	  },
	  "memory": {
	    "rss": 20787200,
	    "heapTotal": 21706752,
	    "heapUsed": 13504816
	  },
	  "uptime": 12499,
	  "version": "0.1.0"
	}

## Run Tests

	npm test
