// now we will understand push method
// This method is called by afterRead,afterRead which is callback
// function of _read method,which is called by our read method continuosly
// until our buffer has space

// and so we can say that push method continuosly get called until
// our buffer has some space

Readable.prototype.push = function (data) {
  var state = this._readableState;
  // if our stream has been destroyed just return
  if (state.destroyed) return false;
  // if data is null,which does when end of stream happen
  // call end method
  if (data === null) return end(this, state);
  // and finally if everything is fine, just call the push function
  // which actually does the real thing
  return push(
    this,
    state,
    !state.toBuffer && typeof data === "string" ? Buffer(data) : data
  );
};

function push(self, state, data) {
  if (!state.paused && !state.buffer.length) {
    // if consumer is active,we dont push data to our buffer or
    // clearly we dont store data into buffer
    // we just call ondata method which emit data event
    ondata(self, state, data);
    return true;
  }

  // push data into our buffer array
  // as you can see we are only pushing data to buffer
  // when state of the stream is paused or if our buffer has some storage
  var length = state.buffer.push(data);

  // if this data is first entry then emit readable
  // Consumers using stream.read() (pull mode) rely on 'readable' to know
  //  they can call read()
  if (length === 1) self.emit("readable");

  // This enforces a soft backpressure threshold.
  // If buffer exceeds 16 chunks, signal to stop pushing (e.g. _read()
  // can wait).
  return length < 16;
}

function newListener(name) {
  // this just resume the work
  if (name === "data") this.resume();
}

// this is called by push function when the stream is not paused
function ondata(self, state, data) {
  // just emit the data event and pass the data to the callback function
  self.emit("data", data);
  if (state.destination) {
    if (!state.destination.write(data)) self.pause();
  }
}
