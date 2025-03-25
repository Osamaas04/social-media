import mongoose from "mongoose";

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose
      .connect(process.env.MONGO_DB_CONNECTION_STRING, {
        autoIndex: true,
      })
      .then((mongoose) => mongoose);
  }

  global.mongoose.conn = await global.mongoose.promise;

  return global.mongoose.conn;
}
