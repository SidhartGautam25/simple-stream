// first we will understand two function cork and uncork
// if the stream is in corked state,this means that for now,
// dont write anything,just store it in buffer
// so if you call write() while the stream is in corked state,
// it will buffer the data instead of calling _write immediately

Writable.prototype.cork = function () {
  var state = this._writableState;
  // if the stream is already in corked state,
  // just return
  if (state.corked) return;
  // set the state to cork mode and emit cork event
  state.corked = true;
  this.emit("cork");
};

Writable.prototype.uncork = function () {
  var state = this._writableState;
  // if the state is already uncorked, then just return
  if (!state.corked) return;
  // set the stream to uncorked state
  state.corked = false;
  // emit uncork event
  this.emit("uncork");

  // if not currently writing,means no _write is active
  // then call afterWrite which eventually call write method
  // so that writing can continue
  if (!state.writing) state.afterWrite(null);
};
