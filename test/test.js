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
	})
	();
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

exports['nothing'] = function (test) {
	return test.done()
	var q = new Queue();

	q.add(function ( next ) {
		console.log('hello');
		return next();
	});

	q.add(function ( next ) {
		console.log('world');

		return next();
	});

	q.add(function () {
		console.log('done');
	});

	q.execute();


	(new Queue())

	(function ( next ) {
		setTimeout(function () {
			
			console.log('hello 2');
			
			return next('world 2');
			
		}, 1000);
	})

	(function ( world, next ) {
		setTimeout(function () {
			
			console.log(world);

			return next();
			
		}, 1000);
		
		
	})

	(function () {
		
		console.log('done 2');
		
		
	})();

};
