var test = require('tape')
,crisper = require('../')
,undef

test('gives data',function(t){
	t.plan(2)

	var storedData = {a:1}
	var cache = crisper('myData', function(cb){
		process.nextTick(function(){
			cb(false,storedData)
		})
	})

	t.ok(cache.get() === undef, 'returns undef on too-soon')

	process.nextTick(function(){
		t.ok(cache.get() == storedData, 'returns fresh data')
		cache.pause()
	})

})

test('default and stale worky',function(t){
	t.plan(5)

	var storedData = {a:1}
	var cache = crisper('myData', 30000, function(cb){
		process.nextTick(function(){
			cb(false,storedData)
			cache.pause()
		})
	})
	cache.setDefault('giraffe')

	t.ok(cache.get() == 'giraffe', 'custom default returned on too-soon')

	process.nextTick(function(){
		t.ok(cache.get() == storedData, 'got data')
		cache._wait(31000)
		t.ok(cache.get() == 'giraffe', 'default returned when expired')
		t.ok(cache.getStale() == storedData, 'keeps a broken fridge out back')
		cache.setDefault('piglett')
		t.ok(cache.get() == 'piglett', 'can update default')
	})

})

test('pause and resume worky',function(t){
	t.plan(3)

	var storedData = {a:1}
	var cache = crisper('myData', 30000, function(cb){
		process.nextTick(function(){
			cb(false,storedData)
		})
	})

	process.nextTick(function(){
		cache.pause()
		t.ok(cache.get() == storedData, 'still fresh after pause')
		cache._wait(31000)
		t.ok(cache.get() === undef, 'expiration binding after pause')
		cache.resume()
		process.nextTick(function(){
			t.ok(cache.get() == storedData, 'resume worky')
		})
	})
})

test('destroy',function(t){
	t.plan(2)

	var cache = crisper('myData', function(cb){
		process.nextTick(function(){
			cb(false,{a:1})
		})
	})

	cache.setDefault('zebra')

	process.nextTick(function(){
		cache.destroy()
		t.ok(cache.get() === undef, 'you get nuthin once destroyed')
		t.ok(cache._defaultValue === undef && cache._value === undef && cache._timeout === undef, 'data gone')
	})
})

