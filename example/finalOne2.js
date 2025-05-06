//this is because our implementation is incomplete

const Readable = require("../lib/readable");

const stream = new Readable();

let count = 0;

// Inject an afterRead callback to handle _read output
stream._readableState.afterRead = function (err, data) {
  if (err) return stream.destroy(err);
  stream._readableState.reading = false;
  if (data === null) {
    stream.push(null); // signal end
  } else {
    stream.push(data); // push the new chunk
  }
};

stream._read = function (cb) {
  if (count >= 5) {
    return cb(null, null); // end
  }
  cb(null, Buffer.from("" + count++));
};

stream.on("data", function (data) {
  console.log("data is", data.toString());
});

stream.on("end", function () {
  console.log("stream ended");
});

stream.resume(); // start flowing
