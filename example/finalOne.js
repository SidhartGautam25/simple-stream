const Readable = require("../lib/readable");

const stream = new Readable();

let count = 0;

stream._read = function (cb) {
  if (count >= 5) {
    return cb(null, null); // signal end of stream
  }
  cb(null, Buffer.from("" + count++));
};

stream.on("data", function (data) {
  console.log("data is", data.toString());
});

stream.on("end", function () {
  console.log("stream ended");
});

stream.resume(); // Make sure to start the flow of data
