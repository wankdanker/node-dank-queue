var Queue = require('../');

exports['chainish-context'] = function (test) {
	var context = { a : 'hello' };

	Queue({ context : context})
	(function (next) {
		test.equal(this, context)
		return next();
	})
	(function (next) {
		test.equal(this, context);
		return next();
	})
	(function () {
		return test.done();	
	})();
};

exports['chainish-named-queues'] = function (test) {
	var a = [];

	Queue()
	('first', function (next) {
		a.push(1);
		return next();
	})
	('second', function (next) {
		a.push(2);
		return next();
	})
	('first', function (next) {
		a.push(1);
		return next();
	})
	('last', function (next) {
		a.push(3);

		test.deepEqual(a, [1,1,2,3]);
		test.done();
	})();
};

exports['chainish-set-options-then-add-array-of-functions'] = function (test) {
	var a = [];

	Queue({ context : a })
	([
		function (next) {
			this.push(1);
			return next();
		}
		, function (next) {
			this.push(2);
			return next();
		}
		, function (next) {
			this.push(3);
			return next();
		}
		, function () {
			test.deepEqual(a, [1,2,3]);
			test.done();
		}
	])();
};

exports['chainish-passing-args'] = function (test) {
	var a = [8, 6, 7, 5, 3, 0, 9];

	Queue({ context : [] })
	([
		function (next) {
			return next(a[0], a[1], a[2], a[3]);
		}
		, function (w, x, y, z, next) {
			this.push(w);
			this.push(x);
			this.push(y);
			this.push(z);

			return next(a[4], a[5], a[6]);
		}
		, function (w, x, y, next) {
			this.push(w);
			this.push(x);
			this.push(y);

			return next();
		}
		, function () {
			test.deepEqual(a, this);
			test.done();	
		}
	])();
};

exports['chainish-array-event-emitter'] = function (test) {
	Queue([
		function (next) {
			return next();
		}
		, function () {
			this.emit('hello');
		}
	]).on('hello', function () {
		test.done();
	})();
};

exports['chainish-event-emitter'] = function (test) {
	Queue()
	(function (next) {
		this.emit('hello', 'world');
		return next();
	})
	(function () {
		this.emit('hi');
	}).on('hello', function (arg) {
		test.equal(arg, 'world');
	}).on('hi', function () {
		test.done();
	})();
	
};

exports['object-instantiate-add-execute'] = function (test) {
	a = [];

	var q = new Queue();
	
	q.add(function (next) {
		a.push(1);

		return next();
	});

	q.add(function (next) {
		a.push(2);

		return next();
	});

	q.add(function (next) {
		a.push(3);
		
		test.deepEqual(a, [1,2,3]);
		test.done();
	});

	q.execute();

	
};

exports['object-event-emitter'] = function (test) {
	var q = new Queue();

	q.on('hello', function () {
		test.done();
	});

	q.add(function (next) {
		this.emit('hello');
	});

	q.execute();
};

exports['chainish-pass-falsy-arg'] = function (test) {
	Queue()
	(function (next) {
		return next(0);
	})
	(function (arg, next) {
		test.equal(arg, 0);

		return next();
	})
	(function () {
		test.done();
	})();

};

exports['chainish-callback-too-many-times'] = function (test) {
	var count = 0;

	Queue()
	(function (next) {
		next('hello');
		return next();
	})
	(function (arg, next) {
		count += 1;
		test.equal(arg, 'hello');

		return next();
	})
	(function () {
		test.equal(count, 1);
		test.done();
	}) ();
};

exports['chainish-callback-too-many-times-with-error-event'] = function (test) {
	var count = 0;
	var error = null;

	Queue()
	(function (next) {
		next('hello');
		return next();
	})
	(function (arg, next) {
		count += 1;
		test.equal(arg, 'hello');

		return next();
	}).on('error', function (err) {
		error = err;
	}).on('end', function () {
		test.equal(count, 1);
		test.ok(error);
		test.done();
	}) ();
};

exports['chainish-emit-end'] = function (test) {
	Queue()
	(function (next) {
		return next();
	}).on('end', function () {
		test.done();
	})();
};

exports['chainish-test-error-event'] = function (test) {
	Queue()
	(function (next) {
		throw Error('some error');
	}).on('error', function (e) {
		test.done();
	}) ();
};

exports['object-multiple-with-error-thrown'] = function (test) {
	var q = new Queue({ jobs : 3 });

	q.add(function (next) {
		throw new Error('oops');
	});

	q.add(function (next) {
		return next();
	});

	q.add(function (next) {
		return next();
	});

	q.add(function (next) {
		return next();
	});

	q.add(function (next) {
		return next();
	});

	q.on('error', function () {
		test.done();
	});

	q.on('end', function () {
		test.done();
	});

	q.execute();

};

exports['chainish-concurrency'] = function (test) {
	var a = [];

	Queue({ jobs : 3 })
	(function (next) {
		setTimeout(function () {
			a.push(3);
			return next();
		}, 300);
	})
	(function (next) {
		setTimeout(function () {
			a.push(2);
			return next()
		}, 200);
	})
	(function (next) {
		setTimeout(function () {
			a.push(1);
			return next();
		}, 100);
	}).on('end', function () {
		console.log('end');
		test.deepEqual(a, [1,2,3]);
		test.done();
	}).on('error', console.error) ();
};
