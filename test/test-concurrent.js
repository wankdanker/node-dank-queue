var Queue = require('../');

var q = new Queue({ jobs : 3 });

q.add(function ( next ) {
	console.log(0, '******** - Starting');
	
	var id = setTimeout(function () {
		console.log('DELAYED: hello ', +new Date());
		return next();
	}, 5000);
	
	console.log('******** - Done');
});

q.add(function ( next ) {
	console.log(1, 'world ', +new Date());

	return next();
});

q.add(function ( next ) {
	console.log(2, 'done ', +new Date());
	
	return next();
});

q.add(function ( next ) {
	console.log(3, 'asdf ', +new Date());

	return next();
});

q.add(function ( next ) {
	console.log(4, 'asdf2 ', +new Date());

	return next();
});

q.add('finally', function ( next ) {
	console.log(5, 'really really done');
	
	return next();
});


q.add('finally 2', function ( next ) {
	console.log(6, 'really really really done');
	
	return next();
});

q.add('finally 2', function ( next ) {
	console.log(this);
	
	return next();
});


q.execute();


// (new Queue())
// 
// (function ( next ) {
// 	setTimeout(function () {
// 		
// 		console.log('hello 2');
// 		
// 		return next('world 2');
// 		
// 	}, 1000);
// })
// 
// (function ( world, next ) {
// 	setTimeout(function () {
// 		
// 		console.log(world);
// 
// 		return next();
// 		
// 	}, 1000);
// 	
// 	
// })
// 
// (function () {
// 	
// 	console.log('done 2');
// 	
// 	
// })();
