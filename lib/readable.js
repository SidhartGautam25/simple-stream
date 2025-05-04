const EventEmitter = require("events");

function ReadableState() {
  this.toBuffer = false;
  this._stream = true;
  this.syncRead = false;
  this.destroyed = false;
  this.destroyReason = null;
  this.reading = true;
  this.paused = true;
  this.ended = false;
  this.endEmitted = false;
  this.buffer = [];
  this.destination = null;
  this.afterRead = null;
  this.afterDestroy = null;
  this.afterPipe = null;
}

function Readable(opts) {
  if (!(this instanceof Readable)) {
    return new Readable(opts);
  }
  if (!opts) {
    opts = {};
  }
  EventEmitter.call(this);
  this._readableState = new ReadableState();

  if (opts.read) {
    this._read = opts.read;
  }
  if (opts.destroy) {
    this._destroy = opts.destroy;
  }
}

Readable.prototype = Object.create(EventEmitter.prototype);
Readable.prototype.constructor = Readable;

Readable.prototype.read = function () {
  var state = this._readableState;
  var data = state.buffer.shift() || null;
  if (data) this.emit("data", data);
  read(this, state);
  emitEndMaybe(this, state);
  return data;
};

function ondata(self, state, data) {
  self.emit("data", data);
  if (state.destination && typeof state.destination.write === "function") {
    if (!state.destination.write(data)) {
      self.pause();
    }
  }
}

Readable.prototype.push = function (data) {
  const state = this._readableState;
  if (state.destroyed) {
    return false;
  }
  if (data === null) {
    return end(this, state);
  }
  if (!state.toBuffer && typeof data === "string") {
    data.Buffer.from(data);
  }
  return push(this, state, data);
};

Readable.prototype.pause = function () {
  const state = this._readableState;
  if (state.destroyed || state.paused) {
    return;
  }
  state.paused = true;
  this.emit("pause");
};

Readable.prototype.resume = function () {
  const state = this._readableState;
  if (state.destroyed || !state.paused) {
    return;
  }
  state.paused = false;
  this.emit("resume");
  while (!state.paused && state.buffer.length > 0) {
    ondata(this, state, state.buffer.shift());
  }
  emitEndMaybe(this, state);
  read(this, state);
};

function push(self, state, data) {
  if (!state.paused && state.buffer.length === 0) {
    ondata(self, state, data);
    return true;
  }
  const length = state.buffer.push(data);
  if (length === 1) {
    self.emit("readable");
  }
  return length < 16;
}

function end(self, state) {
  state.ended = true;
  emitEndMaybe(self, state);
  return false;
}

function emitEndMaybe(self, state) {
  if (
    !state.paused &&
    state.ended &&
    state.buffer.length === 0 &&
    !state.endEmitted
  ) {
    state.endEmitted = true;
    state.paused = true;
    self.emit("end");
    self.destroyMaybe?.();
  }
}

function read(self, state) {
  while (
    !state.destroyed &&
    !state.ended &&
    !state.reading &&
    state.buffer.length < 16
  ) {
    state.reading = true;
    state.syncRead = true;
    self._read(state.afterRead || (() => {}));
    state.syncRead = false;
  }
}

Readable.prototype._read = function (cb) {
  cb(null, null);
};

Readable.prototype.pipe = function (dest, cb) {
  const state = this._readableState;
  if (state.destination) {
    throw new Error(`can only pipe to one destination`);
  }
  state.destination = dest;
  state.afterPipe = cb || null;

  const onError = (err) => {
    if (state.afterPipe) {
      const fn = state.afterPipe;
      state.afterPipe = null;
      fn(err);
    }
  };

  const onFinish = () => {
    if (state.afterPipe) {
      const fn = state.afterPipe;
      state.afterPipe = null;
      fn(null);
    }
  };

  dest.on?.("error", onError);
  dest.on?.("finish", onFinish);
};

Readable.prototype.destroy = function (err) {
  const state = this._readableState;
  if (state.destroyed) {
    return;
  }

  state.destroyed = true;
  if (err) {
    state.destroyReason = err;
  }
  state.reading = false;
  state.paused = true;
  state.endEmitted = true;

  if (state.destination && typeof state.destination.destroy === "function") {
    state.destination.destroy();
  }

  this._destroy(state.afterDestroy || (() => {}));
};

Readable.prototype._destroy = function (cb) {
  if (typeof cb === "function") {
    if (this._readableState.destroyReason) {
      cb(this._readableState.destroyReason);
      this.emit("error", this._readableState.destroyReason);
    }
    this.emit("close");
  }
};

Readable.prototype.destroyMaybe = function () {
  const state = this._readableState;
  if (!state.endEmitted) {
    return;
  }
  this.destroy();
};

module.exports = Readable;
