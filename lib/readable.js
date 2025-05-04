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

module.exports = Readable;
