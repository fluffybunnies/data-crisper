[![Build Status](https://secure.travis-ci.org/fluffybunnies/data-crisper.png)](http://travis-ci.org/fluffybunnies/data-crisper)

# data-crisper

Refresh cached data on a decaying interval. Getter is synchronous and non-blocking for client performance. For use when your app is ok with stale data when requests are low.


## Usage
```javascript
var crisper = require('data-crisper')

var cache = crisper(30000, function(cb){
	api.fetch('get/my/data',function(err,data){
		cb(err,data)
	})
})

require('http').createServer(function(req, res){
	var myData = cache.get()
	,footerHtml = renderView('footer', myData)
	res.end('<html><body><header>my website</header>is awesome.'
		+ 'heres some less important info in the footer:<footer>'+footerHtml+'</footer></body></html>')
}).listen(3000)

// optional: set default value - will be returned if no data in cache
cache.setDefault({});

```


## Methods


### crisper(ttl, fetchData [, defaultValue])

Returns a `Crisper` that will `fetchData()` and update cache every `ttl` ms behind the scenes

`ttl` will increase over time if data is not being accessed

`ttl` will reset if `fetchData()` calls back with an error

`fetchData` is the only required field; `ttl` defaults to 30000 (30 sec)


### Crisper.get()

Returns last successfully stored value

Otherwise returns `getDefault()`


### Crisper.getSilently()

Same as 'get()' but will not affect `ttl`


### Crisper.setDefault( value )

Set the `value` returned if data has never been set


### Crisper.getDefault()

Return the current default


### Crisper.pause()

Stop fetching

The value returned from `get()` will not change while paused


### Crisper.resume()

Resume fetching


### Crisper.destroy()

You never want to use this data again



## To Do
- Use global timer if # timeouts reach a threshold



