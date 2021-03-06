[![Build Status](https://secure.travis-ci.org/fluffybunnies/data-crisper.png)](http://travis-ci.org/fluffybunnies/data-crisper)

# data-crisper

Refresh cached data on a decaying interval. Getter is synchronous and non-blocking for client performance. For use when your app is ok with stale data when requests are infrequent.


## Usage
```javascript
var crisper = require('data-crisper')

var footerDataCache = crisper(60000, function(cb){
	api.fetch('get/my/data',function(err,data){
		cb(err,data)
	})
})

require('http').createServer(function(req, res){
	var footerHtml = renderView('footer', footerDataCache.get())
	res.end('<html><body>'
		+ '<header>My website</header><main>is awesome.</main>'
		+ 'heres some less important info in the footer:<footer>'+footerHtml+'</footer>'
	+ '</body></html>')
}).listen(3000)

// optional: set default value - will be returned if no data in cache
footerDataCache.setDefault({});

```


## Api


### crisper( [ttl,] fetchData [, defaultValue] )

Returns a `Crisper` that will `fetchData()` and update cache every `ttl` ms behind the scenes

`ttl` will increase over time if data is not being accessed

`ttl` will reset if `fetchData()` calls back with an error

`fetchData` is the only required field; `ttl` defaults to 30000 (30 sec)


### Crisper.get()

Returns last successfully stored value

Otherwise returns `getDefault()`


### Crisper.getSilently()

Same as `get()` but will not affect `ttl`


### Crisper.setDefault( value )

Set the `value` returned if data has never been set


### Crisper.getDefault()

Return the current default


### Crisper.pause()

Stop fetching

The value returned from `get()` will not change while paused. i.e. values in the process of being fetched will be trashed.


### Crisper.resume()

Resume fetching


### Crisper.destroy()

You never want to use this data again



## To Do
- Use global timer if # timeouts reach a threshold



