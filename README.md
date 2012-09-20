node-dank-queue
---------------

A versatile async helper utility lacking documentation AND tests.


example
-------

```javascript
var Queue = require("dank-queue");

(new Queue())

(function (next) {
	setTimeout(function () {
		return next('hello');
	}, 1000);
})

(function (what, next) {
	console.log('%s world', what);
})

();

//or

Queue.queue([
	function (next) {
		setTimeout(function () {
			return next('cold');
		},1000);
	}
	, function (what, next) {
		console.log('%s beer', what);
	}
]).execute();

//or

var q = new Queue();

q.add(function (next) {
	setTimeout(function () {
		return next('red');
	});
});


q.add(function (what, next) {
	console.log('%s wine', whate);
});


q.execute();

//and there is more but this is all for now.
```
