const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kdv73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("eWarehouse").collection("items");

    // items api
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    // get items
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);
      console.log(item);
      res.send(item);
    });

    // PUT
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const quantityOfItem = req.params.quantity;
      console.log(quantityOfItem);
      //find id
      const query = { _id: ObjectId(id) };
      const cursor = itemCollection.findOne(query);
      const updateQuantity = await cursor.updateOne(
        { quantity: quantityOfItem },
        { $set: { quantity: quantityOfItem } }
      );
      res.send(updateQuantity);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log(req);
  res.send("Running Server");
});

// listen port
app.listen(port, () => {
  console.log("Listening to port", port);
});
