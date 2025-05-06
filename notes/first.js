this.on("newListener", newListener);
// This registers a listener for the 'newListener' event, which is a special
// internal Node.js event emitted whenever a new event listener is added to
// any EventEmitter (like your stream).
// So any event listener like stream.on("data",cb),call the newListener
// function

process.nextTick(afterRead);
// This schedules the afterRead() function to run on the next tick of the
// event loop, after the current synchronous execution completes.
// So once the constructor thing completes,kick off the reading process

// And so we can say that AfterRead is the entry point into the
// first read cycle

// ---------------> Understanding Properties <---------------------

this.toBuffer = false;
// etermines whether incoming data (like strings) should be converted into
// Buffer objects.

this.syncRead = false;
// Indicates whether the stream is in the middle of a synchronous _read() call.

// Prevents recursive, nested reads that can happen if you push() and call
// read() in the same tick.

this.destroyed = false;
// Marks whether the stream has been terminated or broken (manually or due
// to error).

// Once true, no reads, pushes, or events should occur anymore.

this.destroyReason = null;
// Holds an error object (or string) that caused destruction, if any.
// Provides context when error is emitted during _destroy()

this.reading = true;
// Whether the stream is currently in a _read() operation.
// Prevents redundant calls to _read() while one is already running.
// Simply we want to run _read only when no _read is happening

this.paused = true;
this.ended = false;
// Whether the stream has received an explicit .push(null), meaning no more
// data.
// Triggers the potential for an end event if buffer is empty.

this.endEmitted = false;
// Indicates if the 'end' event has already been emitted

this.buffer = [];
// Internal queue of data chunks pushed via .push() but not yet consumed via
// .read() or emitted via 'data'.

this.destination = null;
//  The writable destination this readable stream is piped into.

this.afterRead = null;
//  A callback used as a handler for _read() results.
// Passed to _read() → called when new data is ready (or null).

this.afterDestroy = null;
//  A cleanup/error handler called when the stream is fully destroyed.
// Used to emit 'error' and 'close' events.

this.afterPipe = null;
// A callback used when .pipe() is done or failed.
// Signals end of pipe lifecycle (success or error).
// Called in event handlers on destination ('error', 'finish').

function afterRead(err, data) {}
// callback function passed into _read

// When the stream implementation (you) has fetched data, it calls this to
// tell the stream engine what you got.

function afterRead(err, data) {
  // if any occured,destroy the stream
  if (err) return self.destroy(err);

  // push function called and data has been passed
  if (data || data === null) self.push(data);

  // since data has been passed,reading is done so set to false,
  // so that next reading can be done
  state.reading = false;

  // If we are not already inside a synchronous read() loop, trigger another
  //  read pass.
  // so syncRead just take care of read function,only one read call
  // should be active at a time
  // no recursive thing allowed
  if (!state.syncRead) read(self, state);
}

// Now come to read function
// overall It repeatedly calls _read() as long as the buffer needs more data
// and it's safe to do so.
function read(self, state) {
  while (
    !state.destroyed && // stream should be alive
    !state.ended && //  Not ended by push(null)
    !state.reading && // No current _read in progress
    state.buffer.length < 16 // Buffer has room
  ) {
    // since we are going to call _read, we are setting reading to true
    state.reading = true;

    // syncRead lets afterRead() know not to trigger another read recursively.
    state.syncRead = true;
    // Call the user-defined _read() method, passing in the afterRead callback.
    // and what we expect from a user ?? to specify the data which they
    // want our stream to work on and after specifying what data they
    // want to provide us,just call the provided callback function with
    // data which is calling afterRead with data arg,and when the afterRead
    // got the data,they will call push method on it,so now we will look
    // push method
    self._read(state.afterRead);

    // Done with this sync _read() call
    state.syncRead = false;
  }
}
