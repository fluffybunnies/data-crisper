
var fib = require('fib')
,defaultTtl = 30000
,maxTtl = 2147483647

module.exports = crisper

function crisper(/* ttl, fetchData, defaultValue */){
	var ttl,fetchData,defaultValue
		,i,undef
	for (i=0; i<arguments.length && i<3; ++i) {
		if (ttl === undef && !isNaN(arguments[i]))
			ttl = +arguments[i]
		else if (fetchData === undef && arguments[i] instanceof Function)
			fetchData = arguments[i]
		else if (defaultValue === undef)
			defaultValue = arguments[i]
	}
	if (ttl === undef)
		ttl = defaultTtl
	return new Crisper(ttl, fetchData, defaultValue)
}

function Crisper(ttl, fetchData, defaultValue){
	var z = this
	z._ttl = ttl < maxTtl ? ttl : maxTtl
	z._fetchData = fetchData
	z._defaultValue = defaultValue

	z._resetTtl()
	z._lastRequest = null
	z._fetchVersion = 0

	z._startFetching()
}

Crisper.prototype.get = function(){
	var z = this
	z._lastRequest = Date.now()
	if (z._modTtl != z._ttl) {
		z._resetTtl()
		z._startFetching(z._ttlRemaining())
	}
	return z._get()
	
}

Crisper.prototype.getSilently = function(){
	return this._get()
}

Crisper.prototype.setDefault = function(value){
	this._defaultValue = value
}

Crisper.prototype.getDefault = function(){
	return this._defaultValue
}

Crisper.prototype.pause = function(){
	this._invalidateFetching()
	this._paused = true
}

Crisper.prototype.resume = function(){
	if (!this._paused)
		return;
	this._paused = false
	this._startFetching(this._ttlRemaining())
}

Crisper.prototype.destroy = function(){
	this.pause()
	delete this._value
	delete this._fetchData
	delete this._defaultValue
}


Crisper.prototype._ttlRemaining = function(){
	return this._value ? this._value.t + this._modTtl - Date.now() : 0
}

Crisper.prototype._increaseTtl = function(){
	this._modTtl = this._ttl*fib(++this._ttli)
	if (this._modTtl > maxTtl)
		this._modTtl = maxTtl
}

Crisper.prototype._resetTtl = function(){
	this._ttli = 1
	this._modTtl = this._ttl
}

Crisper.prototype._get = function(data){
	return this._value ? this._value.v : this.getDefault()
}

Crisper.prototype._set = function(data){
	this._value = {
		v: data
		,t: Date.now()
	}
}

Crisper.prototype._invalidateFetching = function(wait){
	clearTimeout(this._timeout)
	delete this._timeout
	++this._fetchVersion
}

Crisper.prototype._startFetching = function(wait){
	var z = this
	z._invalidateFetching()
	z._timeout = setTimeout(function(){
		z._fetch()
	},wait||0)
}

Crisper.prototype._fetch = function(){
	var z = this
		,lastRequestBefore = z._lastRequest
		,fetchVersion = z._fetchVersion
	z._fetchData(function(err,data){
		if (z._paused || fetchVersion != z._fetchVersion)
			return;
		if (err) {
			// reset ttl on error
			z._resetTtl()
		} else {
			z._set(data)
		}
		z._timeout = setTimeout(function(){
			if (lastRequestBefore == z._lastRequest) // no requests made since last fetch
				z._increaseTtl()
			z._fetch()
		},z._modTtl)
	})
}

