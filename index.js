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
    // console.log(allUser)
    res.send(allUser)
})

app.get("/allUsers/:userRole", async (req, res) => {
    const user = req.params.userRole;
    const query = { userRole:  user};
    const result = await allUsers.find(query).toArray();
    res.send(result);
  });


//   app.put("/allUser/userRole/:id", async (req, res) => {
   
//     const id = req.params.id;
//     const filter = { _id: ObjectId(id) };
//     const option = { upsert: true };
//     const updateDoc = {
//       $set: {
//         role: "admin",
//       },
//     };
//     const result = await allUsers.updateOne(filter, updateDoc, option);
//     res.send(result);
//   });

//   app.get("/allUser/admin/:email", async (req, res) => {
//     const email = req.params.email;
//     const query = { email };
//     const user = await allUsers.findOne(query);
//     res.send({ isAdmin: user?.role === "admin" });
//   });







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
// posting a product
 app.post('/allBikes', async(req, res)=>{
    const query = req.body;
    const result = await bikeCollection.insertOne(query)
    res.send(result)
})
// getAllBikesCollectionServiceByID
app.get("/allCategories/:CategoryName", async (req, res) => {
    const id = req.params.CategoryName;
    const query = {CategoryName : id}
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

app.get("/myProduct/:email", async (req, res) => {
    const email = req.params.email;
    const query = {email: email}
    const myProduct = await  bikeCollection.find(query).toArray()
    console.log(myProduct,"productID")
    res.send(myProduct);
});

// gettingOrderByBooking

app.post('/booked', async(req, res)=>{
    const query = req.body;
    const receivedOrderByBooking = await bookedCollection.insertOne(query)
    // console.log(receivedOrderByBooking)
    res.send(receivedOrderByBooking)
})

// fine total order by per user


app.get('/ordered/:email', async(req, res)=>{
    const id = req.params.email;
    const query = {customerEmail: id};
    const receivedAllOrder = await bookedCollection.find(query).toArray()
    // console.log(receivedAllOrder)
    res.send(receivedAllOrder)
})


run().catch(error => console.error(error))








app.get('/', (req, res)=>{
    res.send('Server is running')
})

app.listen(port, (req, res)=>{
    console.log(`dream bike is running ${port}`)
})