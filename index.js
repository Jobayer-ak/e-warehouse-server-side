const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

    // Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      console.log(accessToken);
      res.send({ accessToken });
    });

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
      console.log(req.params.quantity);
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);

      res.send(item);
    });

    // ADD
    app.post("/items", async (req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    // Delete
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.deleteOne(query);

      res.send(result);
    });

    // update
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = { _id: ObjectId(id) };
      const options = {
        upsert: true,
      };
      const updateDoc = {
        $set: {
          quantity: data.quantity,
        },
      };

      const result = await itemCollection.updateOne(filter, updateDoc, options);

      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Server");
});

// listen port
app.listen(port, () => {
  console.log("Listening to port", port);
});
