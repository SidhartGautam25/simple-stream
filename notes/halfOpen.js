// now we will understand halfOpen property
// if halfOpen = true,this means even if the writable part of the stream
// has ended,still dont destroy or finish the readable part of the
// stream

// but if halfOpen==false,then that means if the writable part came to
// an end, then readable part should also be finish, and hence in afterEnd,
// since writeable part is over we should end the readable part also,
// and by putting null we are saying end the readable part also
