var q = require('../');
var hd = require('heapdump');

var a = [];

for (var x = 0; x < 20000; x++) {
	a.push(x);
}

a.forEach(function (v) {
	q() (function (next) {
		this.b = 1;

		return next();
	})

	(function (next) {
		this.b += 1;
		
		return next();
	})

	(function (next) {
		this.b += 2;

		if (v == a.length - 1) {
			finish();
		}
		
		return next();
	}) ();
});

//delete a;

//hd.writeSnapshot();

function finish() {
	for (var x = 0; x < a.length; x++) {
		a[x] = null;
	}

	a = null;

	hd.writeSnapshot();
}

setInterval(function () {
//	console.log(process.memoryUsage())
	if (typeof gc === 'function') {
		gc();
	}
}, 200);
