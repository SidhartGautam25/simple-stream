const fs = require("fs");
const Readable = require("../lib/readable");
let count = 0;

// Create readable stream
const stream = new Readable();

// Provide a working _read function
stream._read = function (cb) {
  // End the stream after 5 chunks
  if (count >= 5) return cb(null, null);

  const data = `chunk-${++count}\n`;
  setTimeout(() => cb(null, data), 100); // async simulated delay
};

// Provide afterRead hook
stream._readableState.afterRead = function (err, data) {
  if (err) return stream.destroy(err);

  if (data !== null) stream.push(data);
  else stream.push(null); // End the stream

  stream._readableState.reading = false;
  Readable.read(stream, stream._readableState); // <-- restart reading if needed
};

// Optional: cleanup hook
stream._readableState.afterDestroy = function (err) {
  if (err) stream.emit("error", err);
  stream.emit("close");
};

// Listen to events
stream.on("data", function (data) {
  console.log("we have some data ", data);
});
stream.on("end", () => console.log("✅ Stream ended"));
stream.on("close", () => console.log("✅ Stream closed"));
stream.on("error", (err) => console.error("❌", err.message));

// Pipe to a writable stream
const writable = fs.createWriteStream("./output.txt");

stream.pipe(writable, (err) => {
  if (err) return console.error("❌ Pipe error:", err.message);
  console.log("✅ Pipe finished");
});

// ✅ Most important: kickstart reading manually
const { _readableState } = stream;
_readableState.reading = false;
Readable.read(stream, _readableState); // <-- THIS TRIGGERS THE ENTIRE CYCLE
