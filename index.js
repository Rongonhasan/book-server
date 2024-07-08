const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xng2az1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const booksCollection = client.db("bookdb").collection("books");
    const cartsCollection = client.db("bookdb").collection("carts");
    //  sob book get korai
    app.get('/books', async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    })
  // sob book get kora ses
  
  //  carts collection nav bar er oi cart er hisab niaksh
  app.get('/carts', async (req, res) => {
    const email = req.query.email;
    const query = {email: email};
    const result = await cartsCollection.find(query).toArray();
    res.send(result);
  })
  app.post('/carts', async (req, res) => {
    const cartItem = req.body;
    const result = await cartsCollection.insertOne(cartItem);
    res.send(result);

  })

app.delete('/carts/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id : new ObjectId(id)}
  const result = await cartsCollection.deleteOne(query);
  res.send(result);
})
// cart er hisab ses


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World! Man')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})