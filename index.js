const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');





app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173','https://assignment-11-1b23d.web.app', 'http://localhost:5176'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

const jwt = require('jsonwebtoken');



app.get('/', (req, res) => {
  res.send('Hello')
})

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const verifyToken = async(req, res, next) => {
  const token = req.cookies.token;
  if(!token){
    return res.status(401).send({message: 'Forbidden Access'});
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if(err){
      return res.status(401).send({message: 'Forbidden Access'})
    }
    req.user = decoded;
    console.log('in Verify', req.user);
    next();
  })
}



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
    const submittedCollection = database.collection("submittedCollection");
    const featureCollection = database.collection("FeatureCollection");

    app.get('/allAssignment', async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      // console.log(result);
      res.send(result);
    })

    app.get('/update/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const email = req.query.email
      const email1 = req.query.email
      if(email !== email1){
        return res.status(403).send({Message: 'Forbidden Access'})
      }
      const query = { _id: new ObjectId(id) }
      console.log(id);
      const result = await assignmentCollection.findOne(query)
      res.send(result)
    })

    app.get('/details/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const email1 = req.user.email;
      if(email !== email1){
        return res.status(403).send({message: 'Forbidden Access'})
      }
      console.log('in Details : ', email, email1);
      const query = { _id: new ObjectId(id) }
      const result = await assignmentCollection.findOne(query);

      res.send(result)
    })

    app.get('/difficulty', async (req, res) => {
      console.log(req.query);
      const query = { difficulty: req.query.diff };
      const result = await assignmentCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/submitAssignment', verifyToken, async (req, res) => {
      console.log(req.user);
      console.log(req.query);
      if(req.user.email !== req.query.email){
        return res.status(403).send({message: 'Forbidden Accsee'})
      }
      const query = { status: 'pending'}
      const result = await submittedCollection.find(query).toArray();
      // console.log('IN submit', result);
      res.send(result)
    })

    app.get('/getMark/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id)}
      const result = await submittedCollection.findOne(query)
      res.send(result)
    })

    app.get('/feature', async(req, res) => {
      const result = await featureCollection.find().toArray();
      res.send(result);
    })

    app.patch('/obtainedMark', async(req, res) => {
      const data = req.body;
      const id = data.id;
      const filter = { _id : new ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          obtainedMarks: data.obtainedMarks,
          feedback: data.feedback,
          status: data.status
        },
      };
      
      const result = await submittedCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.post('/created',verifyToken, async (req, res) => {
      const email = req.query.email;
      const email1 = req.user.email;
      if(email !== email1){
       return res.status(403).send('Forbiddent Access');

      }
      console.log('In Created : ', email, email1);
      const assignment = req.body;
      const result = await assignmentCollection.insertOne(assignment)
      res.send(result)
    })

    app.post('/submitAssignment', async (req, res) => {
      const data = req.body;
      // console.log(data);
   
      
      const result = await submittedCollection.insertOne(data)
      
      res.send({success: true});
      
    })

    app.post('/jwt', async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
      res
      .cookie('token', token, cookieOptions)
      .send({success: true})
    })

    app.post('/logout', async(req, res) => {
      const user = req.body;
  
  res
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .send({ success: true });
    })



    app.get('/mysubmission',verifyToken, async (req, res) => {
      const email = req.query.email;
      const rEmail = req.user.email;
      console.log('in My ', rEmail);
      if(email !== rEmail){
        return res.status(403).send({message: 'Forbidden Access'})
      }
      // console.log('in my ', email);
      const query = { submitEmail: email };
      const result = await submittedCollection.find(query).toArray() || [];
      res.send(result)
    })

    app.put('/updateAssignment/:id', async (req, res) => {
      const data = req.body;
     
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: data.title,
          marks: data.marks,
          difficulty: data.difficulty,
          img_url: data.img_url,
          description: data.description,
          email: data.email,
          due_date: data.due_date
        }
      };
      const result = await assignmentCollection.updateOne(query, updateDoc, options)
      console.log(result);
      res.send(result)
    })

    app.delete('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
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