const Readable = require("../lib/readable");

const stream = new Readable();

stream._read = function (cb) {
  setTimeout(() => {
    const data =
      this._readableState.buffer.length >= 5 ? null : `data-${Date.now()}`;
    cb(null, data);
  }, 100);
};

stream._readableState.afterRead = function (err, data) {
  if (err) return stream.destroy(err);
  if (data !== null) stream.push(data);
  stream._readableState.reading = false;
  read(stream, stream._readableState);
};

stream.on("data", (chunk) => {
  console.log("[data]", chunk);
});

stream.on("end", () => {
  console.log("[end]");
});

stream.resume(); // Start the flow
