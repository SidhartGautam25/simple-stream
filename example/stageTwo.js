const Readable = require("../lib/readable");

const stream = new Readable();

stream._read = function (cb) {
  setTimeout(() => {
    const data =
      this._readableState.buffer.length >= 5 ? null : `data-${Date.now()}`;
    cb(null, data);
  }, 100);
};

stream._readableState.afterRead = function afterRead(err, data) {
  if (err) {
    console.log("err occured");
    return;
  }
  if (data !== null) {
    stream.push(data);
  }
  stream._readableState.reading = false;
  read(stream, stream._readableState);
};

stream.on("data", (chunk) => {
  console.log("[data]", chunk.toString());
});

setInterval(() => {
  const chunk = stream.read();
  if (chunk) {
    console.log("[manual read] ", chunk.toString());
  }
}, 200);
