// here we will discuss pipe,resume,pause and ondata methods
// first we will understand resume method

// overall this function first set the state of the stream to resumable
// meaning state.paused=false;
Readable.prototype.resume = function () {
  var state = this._readableState;

  // if the stream is destroyed or is in resumable state before,
  // then just return from here
  if (state.destroyed || !state.paused) return;
  // now set the paused property to false
  state.paused = false;
  // and also emit resume event so that listener can know
  // that the stream is in resumable state
  this.emit("resume");
  while (!state.paused && state.buffer.length) {
    // call ondata while the state is in resume state and while
    // there is anything in our buffer
    // ondata in short emit data event and do pause stuff which we
    // see later
    ondata(this, state, state.buffer.shift());
  }

  // since our buffer is now empty we are calling emitendmaybe
  // which we will see in few minutes
  emitEndMaybe(this, state);
  // since buffer array is empty,we can have new data and so called
  // read method which calls _read continuously
  read(this, state);
};

// now come to pipe method
// which in general connect the readable stream to a writeable stream
Readable.prototype.pipe = function (dest, cb) {
  var state = this._readableState;
  var wstate = dest._writableState;

  // if destination is already present,just give an error
  if (state.destination) throw new Error("Can only pipe a stream once");
  // set the destination to a writeable stream which is arg of this pipe
  // method
  state.destination = dest;

  // set the callback passed to pipe to afterPipe
  wstate.afterPipe = cb || null;
  // now just like no dest should be there from past,similarly,
  // there should be no source attached to this writeable stream
  // state as this means it has been attached to a readable stream
  // in past which we dont want to disturb
  if (wstate.source)
    throw new Error("Can only pipe a single stream to a writable one");

  // now set the source of this writable stream to our current
  // readable stream
  wstate.source = this;
  this.on("error", errorFun);
  dest.on("error", errorFun);

  // we want to resume(if it is not) the stream so that flow
  // start
  this.resume();
  // returning the dest to user (so that they can inspect thing our
  // they can chain the pipe)
  return dest;
};

// now come to onData method which is very important
function ondata(self, state, data) {
  // first it emit the data event as there is data present
  // for the listener
  self.emit("data", data);
  if (state.destination) {
    if (!state.destination.write(data)) {
      // now if there is any destination attached
      // and if the write method of writeable stream is returning
      // false which means there is not enough space and
      // so readable stream should be paused
      // and so self.pause() method get called
      self.pause();
    }
  }
}
