const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000
require("dotenv").config();

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require("express");
const uri = `mongodb+srv://${process.env.YDBIKE_NAME}:${process.env.YDBIKE_KEY}@cluster0.mlxcjcs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// allTypesCollections
const allCategories = client.db("YDBIKE").collection('BikeCategories')
const allUsers = client.db("YDBIKE").collection('AllUsers')
const bikeCollection = client.db("YDBIKE").collection('AllBikes')
const bookedCollection = client.db("YDBIKE").collection('orderedByBooking')



async function  run(){
    try{
        await client.connect()
        console.log('Dreambike server is running')
    }
    catch(error){
        console.error(error)
    }
}


// allUser details 
app.post('/allUser', async(req, res)=>{
    const user = req.body;
    const saveUser = await allUsers.insertOne(user)
    // console.log(saveUser)
    res.send(saveUser)
})


app.get('/allUser', async(req, res)=>{
    const email= {}
    const allUser = await allUsers.find(email).toArray();
    console.log(allUser)
    res.send(allUser)
})
// providig accessToken  
app.put("/users/:email", async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    console.log(user)
    const userInp = await allUsers.insertOne(user);
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: user,
    };
    const result = await allUsers.updateOne(filter, updateDoc, options);
    // console.log(result);
    const token = jwt.sign({email}, process.env.bikerToken, {
      expiresIn: "500h",
    });
    res.send({userInp, result, token});
  });


// getAllCategories
app.get('/allCategories', async(req, res)=>{
    const  query ={};
     const result = await allCategories.find(query).toArray()
     res.send(result)
 })
// getAllBikesCollection
 app.get('/allBikes', async(req, res)=>{
    const query = {}
    const result = await bikeCollection.find(query).toArray()
    res.send(result)
})
// getAllBikesCollectionServiceByID
app.get("/allCategories/:serviceId", async (req, res) => {
    const id = req.params.serviceId;
    const query = {serviceId : id}
    const serviceCategory = await  bikeCollection.find(query).toArray()
    // console.log(serviceCategory)
    res.send(serviceCategory);
});
app.get("/productId/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)}
    const productId = await  bikeCollection.find(query).toArray()
    // console.log(productId,"productID")
    res.send(productId);
});

// gettingOrderByBooking

app.post('/booked', async(req, res)=>{
    const query = req.body;
    const receivedOrderByBooking = await bookedCollection.insertOne(query)
    console.log(receivedOrderByBooking)
    res.send(receivedOrderByBooking)
})

// fine total order by per user


app.get('/ordered/:email', async(req, res)=>{
    const id = req.params.email;
    const query = {customerEmail: id};
    const receivedAllOrder = await bookedCollection.find(query).toArray()
    console.log(receivedAllOrder)
    res.send(receivedAllOrder)
})


run().catch(error => console.error(error))








app.get('/', (req, res)=>{
    res.send('Server is running')
})

app.listen(port, (req, res)=>{
    console.log(`dream bike is running ${port}`)
})