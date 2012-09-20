var Queue = require('../');

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
