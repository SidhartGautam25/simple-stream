// here we will see the last part of readable stream
// end,emitEndMayBe,destroy,_destroy,destroyMayBe

// called by push if it gets null ( which means the end )
function end(self, state) {
  // just mark the end property to true
  state.ended = true;

  // This function decides whether it's safe to emit 'end' now
  // (see next function).
  emitEndMaybe(self, state);

  // signaling push and other method that no more data will be
  // accepted
  return false;
}

// called by resume,read and end

// read call this function after continuously calling _read
// means when there is no more _read to call

// resume call this after continuosly calling ondata,
// means when there is no more data left in the buffer
function emitEndMaybe(self, state) {
  if (
    !state.paused &&
    state.ended &&
    !state.buffer.length &&
    !state.endEmitted
  ) {
    // now before emitting end,state should be paused
    // and endEmitted should be true as we are emittinng
    // end event
    state.endEmitted = true;
    state.paused = true;
    self.emit("end");

    if (state.destination) {
      // now if there is any destination attached to this
      // readable stream, then we should remove that as from now,
      // its previous identity should got cleared
      var dest = state.destination;
      state.destination = null;
      // writeable stream end method get called
      dest.end();
    }

    // and since it is the end,we need to destroy the state
    // of this stream, so calling destroyMaybe
    self.destroyMaybe();
  }
}

// now we will come to destroy thing
// and the first one is destroyMaybe

// dont destroy if endEmitted is not true and that means
// stream has not ended
// second,if the stream is also a writeable stream , then if
// finishEmitted is false , then also return because that means
// writeable part of this stream is undone
// now if all those things have been there, then call destroy method
// which actually destroy the stream
Readable.prototype.destroyMaybe = function () {
  if (isWritable && !this._writableState.finishEmitted) return;
  if (!this._readableState.endEmitted) return;
  this.destroy();
};

Readable.prototype.destroy = function (err) {
  var state = this._readableState;
  // if it is already destroyed then just return
  if (state.destroyed) return;
  // mark destroyed to true
  state.destroyed = true;

  if (err) state.destroyReason = err;
  // just confirming the properties are according to end and destroyed
  state.reading = true;
  state.paused = true;
  state.endEmitted = true;

  // if it is also a writeable stream then also destroy writeable
  // properties of the stream
  if (isWritable) this.destroyWritable();

  // destroy the writeable part of stream also
  if (state.destination) {
    var dest = state.destination;
    state.destination = null;
    if (dest.destroy) dest.destroy();
  }

  // and now call the last part,_destroy function
  // now this _destroy will be overridden by the user,means they
  // can define it that what they want after destroying the stream
  // but since this _destroy is called by us or our destroy method,
  // we are the one who pass the afterDestroy method as a callback
  // so even if user override this,they will call the afterDestroy
  // as it is passed to _destroy
  this._destroy(state.afterDestroy);
};

// and afterDestroy does a simple thing it emit close event
function afterDestroy(err) {
  if (!err) err = state.destroyReason;
  if (err) self.emit("error", err);
  self.emit("close");
}

// and now our readable stream part is finally over
