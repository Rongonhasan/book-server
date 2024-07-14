const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');

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

    const usersCollection = client.db("bookdb").collection("users");
    const booksCollection = client.db("bookdb").collection("books");
    const cartsCollection = client.db("bookdb").collection("carts");

    // jwt create 
   app.post('/jwt' , (req, res) => {
    const user = req.body;
    const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {
       expiresIn: '1h'})
       res.send({token})
   })

  //  middlewares
  const verifyToken = (req, res, next) => {
    // console.log('inside verify token', req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      req.decoded = decoded;
      next();
    })
  }
    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

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


// user er api dashboard er jnno signup page a kaj 

app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
 
  const result = await usersCollection.find().toArray();
  res.send(result);
})
// admin hisab 
app.get('/users/admin/:email', verifyToken, async (req, res) => {
  const email = req.params.email;

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: 'forbidden access' })
  }

  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === 'admin';
  }
  res.send({ admin });
})

 app.post('/users', async (req, res) => {

  const user = req.body;
  console.log(user)
  // goggle r jnno extra kaj 
  const query = {email: user.email};
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({massage: 'user already exists'})
  }
  // google end
  const result = await usersCollection.insertOne(user);
  res.send(result);
 })
     
 app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: 'admin'
    }
  }
  const result = await usersCollection.updateOne(filter, updatedDoc);
  res.send(result);
})

 app.delete('/users/:id', verifyToken,verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await usersCollection.deleteOne(query);
  res.send(result);
})

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