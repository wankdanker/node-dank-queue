/*jslint node: true, forin: true, maxerr: 50, indent: 4 */

"use strict";

var sys = require('util'),
	events = require('events');

function Queue(options) {
	//check if this function is not called as a constructor
	if (!this || this.constructor.name !== 'Queue') {
		var q = new Queue(options);
		
		if (Array.isArray(options) || typeof(options) === "function") {
			q.add(options);
		}
		
		return q;
	}
	
	events.EventEmitter.call(this);
	var self = this
		, x
		, retFunction
		;
	
	self.options = options || {};

	self.insertIndex = 0;
	self.queues = {};

	self.lastQueueName = '';
	self.maxConcurrentJobs = self.options.maxConcurrentJobs || self.options.jobs || 1;
	self.runningCount = 0;
	self.runnable = false;
	
	retFunction = function () {
		if (arguments.length) {
			self.add.apply(self, arguments);
		} else {
			self.execute();
		}

		return retFunction;
	};

	for (x in self) {
		retFunction[x] = self[x];
	}

	return retFunction;
}

sys.inherits(Queue, events.EventEmitter);

Queue.prototype.add = function (queueName, fn) {
	var self = this, queue;

	if (typeof (queueName) === 'function' || Array.isArray(queueName)) {
		fn = queueName;
		queueName = self.lastQueueName;
	} else {
		self.lastQueueName = queueName;
	}
	
	if (Array.isArray(fn)) {
		fn.forEach(function(func) {
			
			self.add(queueName, func);
		});
	}
	else {
		queue = self.queues[queueName] = self.queues[queueName] || [];

		queue.push(fn);
	}
	
	return this;
};

Queue.prototype.insert = function (queueName, fn, index) {
	var self = this, queue, tmp;

	if (typeof (queueName) === 'function') {
		index = fn;
		fn = queueName;
		queueName = self.lastQueueName;
	} else {
		self.lastQueueName = queueName;
	}

	if (!index && index !== 0) {
		self.insertIndex += 1;
		index = self.insertIndex;
	}

	queue = self.queues[queueName] = self.queues[queueName] || [];
	tmp = queue.splice(index);

	queue.push(fn);
	queue.concat(tmp);

	return this;
};

Queue.prototype.run = 
Queue.prototype.execute = 
Queue.prototype.start = function () {
	var self = this;
	
	self.runnable = true;
	self.next();

	return this;
};

Queue.prototype.stop = function () {
	var self = this;

	self.runnable = false;
};

Queue.prototype.next = function (args) {
	var self = this, queueName, queue;
	
	if (!self.runnable) {
		return false;
	}
	
	args = args || [];

	self.insertIndex -= 1;

	if (self.insertIndex < 0) {
		self.insertIndex = 0;
	}

	queueName = Object.keys(self.queues)[0];
	queue = self.queues[queueName];

	if (!queue.length && queue.ended === queue.started) {
		delete self.queues[queueName];

		if (Object.keys(self.queues).length) {
			queueName = Object.keys(self.queues)[0];
			queue = self.queues[Object.keys(self.queues)[0]];
		}
	}

	Queue.doWhile(function (cb) {
		var fn, newArgs;

		if (queue && self.runningCount < self.maxConcurrentJobs && queue.length) {
			fn = queue.shift();

			if (fn) {
				newArgs = [].concat(args);

				newArgs.push(function () {
					self.runningCount -= 1;
					queue.ended = (queue.ended || 0) + 1;
					self.next(Array.prototype.slice.call(arguments));
				});

				queue.started = (queue.started || 0) + 1;

				//Increment runningCount BEFORE we execute the function
				self.runningCount += 1;

				process.nextTick(function () {
					if (self.listeners('error').length) {
						try {
							fn.apply(fn, newArgs);
						} catch (e) {
							self.emit('error', e);
						}
					} else {
						fn.apply(fn, newArgs);
					}
					
					//avoid mem leaks
					fn = null;
					newArgs = null;
				});
			}

			return cb(true);
		} else {
			return cb(false);
		}
	});

	return this;
};

Queue.queue = function () {
	return new Queue();
};

Queue.doWhile = function (fn, concurrent) {
	var x, run;

	run = function (fn) {
		fn(function (cont) {
			if (cont) {
				run(fn);
			}
		});
	};

	if (!concurrent) {
		concurrent = 1;
	}

	for (x = 0; x < concurrent; x += 1) {
		run(fn);
	}
};

module.exports = Queue;
