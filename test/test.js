var test = require('tape')
,crisper = require('../')
,undef

test('gives data',function(t){
	t.plan(3)

	var storedData = {a:1}
	var cache = crisper(function(cb){
		process.nextTick(function(){
			cb(false,storedData)
			onDataStored()
		})
	})

	t.ok(cache.get() === undef, 'returns undef on too-soon')
	cache.setDefault('giraffe')
	t.ok(cache.get() == 'giraffe', 'custom default on too-soon')

	function onDataStored(){
		process.nextTick(function(){
			t.ok(cache.get() == storedData, 'got data!')
			cache.destroy()
		})
	}

})

test('poly',function(t){
	t.plan(8)

	var checks = 3
	var timeoutAfter = setTimeout(function(){
		t.fail('getter failed to be called')
		cache1.destroy(); cache2.destroy(); cache3.destroy();
	},2000)

	var cache1 = crisper(10000, function(){
		t.ok(true, 'getter called')
		cache1.destroy()
		if (!--checks) clearTimeout(timeoutAfter)
	}, 'piglett')
	t.ok(cache1._ttl == 10000, 'ttl set')
	t.ok(cache1.getDefault() == 'piglett', 'default set')

	var cache2 = crisper(10000, 'zebra', function(){
		t.ok(true, 'getter called')
		cache2.destroy()
		if (!--checks) clearTimeout(timeoutAfter)
	})
	t.ok(cache2._ttl == 10000, 'ttl set')
	t.ok(cache2.getDefault() == 'zebra', 'default set')

	var cache3 = crisper(function(){
		t.ok(true, 'getter called')
		cache3.destroy()
		if (!--checks) clearTimeout(timeoutAfter)
	})
	t.ok(cache3.getDefault() === undef, 'default set')

})

test('pause and resume worky',function(t){
	t.plan(2)

	var storedData = {a:1}
	var cache = crisper(function(cb){
		process.nextTick(function(){
			cb(false,storedData)
		})
	})
	cache.pause()
	setTimeout(function(){
		t.ok(cache.get() === undef, 'paused before fetch')
		cache.resume()
		setTimeout(function(){
			t.ok(cache.get() == storedData, 'resumed')
			cache.destroy()
		},200)
	},200)

})

test('destroy',function(t){
	t.plan(2)

	var storedData = {a:1}
	var cache = crisper(function(cb){
		process.nextTick(function(){
			cb(false,storedData)
			onDataStored()
		})
	})

	function onDataStored(){
		process.nextTick(function(){
			t.ok(cache.get() == storedData, 'got data')
			cache.destroy()
			t.ok(cache.get() === undef && cache._value === undef, 'data gone')
		})
	}

})

test('increasing ttl',function(t){
	t.plan(8)

	var res = {err:false}
	var ttl = 10
	var cache = crisper(ttl,function(cb){
		process.nextTick(function(){
			cb(res.err, 1)
			onDataStored()
		})
	})

	var num = 0
	function onDataStored(){
		if (num == 2) {
			cache.get()
			ttl = 10
			t.ok(cache._modTtl == ttl, 'ttl reset after get() '+num+' '+cache._modTtl+'=='+ttl)
		} else if (num == 5) {
			res.err = 'some error'
			ttl = 10
		} else if (num == 6) {
			res.err = false
			t.ok(cache._modTtl == ttl, 'ttl reset after error '+num+' '+cache._modTtl+'=='+ttl)
			ttl = Math.ceil(ttl*1.5);
		} else if (num == 7) {
			t.ok(cache.getSilently() === 1, 'getSilently() gives data')
			t.ok(cache._modTtl == ttl, 'ttl untouched after getSilently() '+num+' '+cache._modTtl+'=='+ttl)
		} else if (num == 8) {
			cache.destroy()
		} else {
			t.ok(cache._modTtl == ttl, 'ttl bigger! '+num+' '+cache._modTtl+'=='+ttl)
			ttl = Math.ceil(ttl*1.5);
		}
		++num
	}

})

test('max timeout',function(t){
	t.plan(3)

	// var max = 139586437119
	var max = 2147483647

	var timeout = setTimeout(function(){
		timeout = null
	},max)
	setTimeout(function(){
		t.ok(timeout !== null, 'max timeout ok')
		clearTimeout(timeout)
	},1)

	var cache = crisper(max,function(cb){cb()})
	cache._increaseTtl()
	t.ok(cache._modTtl == max, 'cant decay beyond maxTtl')
	cache.destroy()

	var cache = crisper(max+1,function(cb){cb()})
	t.ok(cache._ttl == max, 'ttl lowered to cap')
	cache.destroy()

})
