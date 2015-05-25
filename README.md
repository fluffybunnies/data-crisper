# data-crisper
Keep your data fresh and your energy bill low.

Refresh cached data on a decaying interval. Getter is synchronous and non-blocking for client performance. For use when your app is ok with null, but not incorrect, data.


### Usage
```javascript
var crisper = require('data-crisper')

var cache = crisper('myData', 30000, function(cb){
	api.fetch('get/my/data',function(err,data){
		cb(err,data)
	})
})

// optional: set default value - will be returned if no fresh data in cache
cache.setDefault({});

require('http').createServer(function(req, res){
	var myData = cache.get()
	,footerHtml = renderView('footer', myData)
	res.send('<html><body><header>my website</header>is awesome.'
		+ 'heres some less important info in the footer:<footer>'+footerHtml+'</footer></body></html>')
}).listen(3000)

```


### Methods

#### crisper(key, interval, fetchData)
Returns a Crisper which will fetchData() every interval behind the scenes
Interval will increase over time if data is not requested
Data becomes stale and interval is reset on fetchData() error

#### Crisper.get()
Returns stored value if fresh (i.e. not expired or pending)
Otherwise returns getDefault()

#### Crisper.getStale()
For if you really really want old data
Returns the most recently stored value regardless of freshness

#### Crisper.setDefault( value )
Set the value returned if data is stale

#### Crisper.getDefault()
Return the current default

#### Crisper.pause()
Stop fetching

#### Crisper.resume()
Resume fetching

#### Crisper.destroy()
You never want to use this data again

