const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pekpvn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const database = client.db("StudentAssignment");
    const assignmentCollection = database.collection("assignmentCollection");

    app.get('/allAssignment', async(req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result)
    })

    app.get('/update/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      console.log(id);
      const result = await assignmentCollection.findOne(query)
      res.send(result)
    })

    app.post('/created', async(req, res) => {
        
        const assignment = req.body;
        const result = await assignmentCollection.insertOne(assignment)
        res.send(result)
    })

    app.put('/updateAssignment/:id', async(req, res) => {
      const data = req.body;
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: data.title ,
          marks: data.marks ,
          difficulty: data.difficulty , 
          img_url: data.img_url , 
          description: data.description , 
          email: data.email 
        }
      };
      const result = await assignmentCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    app.delete('/assignment/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const result = await assignmentCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('Running At : ', port);
})