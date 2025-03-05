const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


async function run() {
    try {
      // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
      await mongoose.connect(uri, clientOptions);
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      ;
    }
  }
  run().catch(console.dir);

const bookSchema = mongoose.Schema({
    book_id: String,
    isbn: String,
    title: String,
    author: String,
    genre: [{
        type: String
    }],
    location: String,
    rating: Number,
    rating_count: Number,
    book_status: Boolean,
    histories: [{
        type: mongoose.Schema.Types.ObjectId, ref: "history"
    }],
    reviews : Array
})

module.exports = mongoose.model("book", bookSchema);