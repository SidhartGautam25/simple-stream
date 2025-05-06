// lets understand afterWrite
// first of all, lets clear a point -> this function is called once a
// chunk has been fully written.
// it continues the write cycle , handle backpressure , and triggers
// drain events if needed

// if any error occurs while handling any chunk,it means we need to
// destroy the whole stream otherwise the overall data will be
// inaccurate

// afterwrite also set writing to false as the current write has been
// completed and now the next item in the buffer (if any) can be
// processed

// aslo if the current write is completed and there is data in buffer ,
// then first call write on the data of buffer before processing
// any new data

// and since or if everything is done and we are still in afterWrite,
// it simply means we have nothing to do now and so we can finish
// the stream and hence call emitFinishMaybe
