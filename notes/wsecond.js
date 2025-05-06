// here we will understand writing property of writable stream
// and how they play an important role in maintaining writable stream

// first writing=true is done before calling _write() so that no more
// or recursive call to _write happens till _write complete

// then in afterWrite it is set to false as _write operation is
// complete

// in destroy() method however,writing is used for a completely diffrent
// purpose , in short as a hack actually,
// in destroy() it is set to true so that no other thing gets written
// or flushed during teardown , it helps prevent emitting finish , or
// processing any more buffered data , after destruction starts
