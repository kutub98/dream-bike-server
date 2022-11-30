const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const uri = `mongodb+srv://${process.env.YDBIKE_NAME}:${process.env.YDBIKE_KEY}@cluster0.mlxcjcs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// allTypesCollections
const allCategories = client.db("YDBIKE").collection("BikeCategories");
const allUser = client.db("YDBIKE").collection("AllUser");
const bikeCollection = client.db("YDBIKE").collection("AllBikes");
const bookedCollection = client.db("YDBIKE").collection("orderedByBooking");

async function run() {
  try {
    await client.connect();
    console.log("Dreambike server is running");
  } catch (error) {
    console.error(error);
  }
}

app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const UserToken = await allUser.findOne(query);
  console.log(email, UserToken);
  if (UserToken) {
    const token = jwt.sign({ email }, process.env.bikerToken, { expiresIn: "776h" });
    return res.send({ bikerToken: token });
  } else {
    res.status(403).send({ bikerToken: " " });
  }
});

function verifyJwt(req, res, next) {
  // console.log("verify inside", req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Unauthorized Access");
  }
  const token = authHeader.split(' ')[1];
  console.log(authHeader, token);
  jwt.verify(token, process.env.bikerToken, function (err, decoded) {
    if (err) {
      console.log(err);
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// VerifyAdmin
const verifyAdmin = async (req, res, next) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await allUser.findOne(query);

  if (user?.role !== "admin") {
    return res.status(403).send({ message: "You're not author" });
  }
  next();
};
// VerifySeller
const verifySeller = async (req, res, next) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await allUser.findOne(query);

  if (user?.role !== "seller") {
    return res.status(403).send({ message: "You're not author" });
  }
  next();
};

// allUser details
app.post("/allUser", async (req, res) => {
  const user = req.body;
  const saveUser = await allUser.insertOne(user);
  // console.log(saveUser)
  res.send(saveUser);
});

app.get("/allUser", async (req, res) => {
  const query = {};
  const allUsers = await allUser.find(query).toArray();
  // console.log(allUser)
  res.send(allUsers);
});

app.get("/allUser/:role", async (req, res) => {
  const user = req.params.role;
  const query = { role: user };
  const result = await allUser.find({}).toArray();
  res.send(result);
});

// getting Seller
app.get("/seller/:Seller", async (req, res) => {
  const user = req.params.Seller;
  const query = { role: user };
  // console.log(query)
  const result = await allUser.find(query).toArray();
//  console.log(result)
 res.send(result)

});
// getting buyers
app.get("/buyer/:Buyer", async (req, res) => {
  const user = req.params.Buyer;
  const query = { role: user };
  // console.log(query)
  const result = await allUser.find(query).toArray();
 console.log(result)
 res.send(result)

});




app.get("/allUser/:email", async (req, res) => {
  const user = req.params.email;
  const query = { email: user };
  const result = await allUser.findOne(query).toArray();
  res.send(result);
});

app.delete("/allUser/:id", verifyJwt, async (req, res) => {
  const id = req.params.email;
  const query = { email: id };
  const result = await allUser.deleteOne(query);
  console.log(result);
  res.send(result);
});

//   app.put("/allUser/role/:id", async (req, res) => {

//     const id = req.params.id;
//     const filter = { _id: ObjectId(id) };
//     const option = { upsert: true };
//     const updateDoc = {
//       $set: {
//         role: "admin",
//       },
//     };
//     const result = await allUser.updateOne(filter, updateDoc, option);
//     res.send(result);
//   });

// app.put('/AllUser/Seller/:id', verifySeller, async (req, res) => {
//   const id = req.params.id;
//   const filter = { _id: ObjectId(id) }
//   const options = { upsert: true };
//   const updatedDoc = {
//       $set: {
//           role: 'admin'
//       }
//   }
//   const result = await allUser.updateOne(filter, updatedDoc, options);
//   res.send(result);
// });

// seller email
app.get("/allUser/seller/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const user = await allUser.findOne(query);
  res.send({ isSeller: user?.role === "Seller" });
});
// admin email
app.get("/allUser/admin/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const user = await allUser.findOne(query);
  res.send({ isAdmin: user?.role === "admin" });
});

// getAllCategories
app.get("/allCategories", async (req, res) => {
  const query = {};
  const result = await allCategories.find(query).toArray();
  res.send(result);
});
// getAllBikesCollection
app.get("/allBikes", async (req, res) => {
  const query = {};
  const result = await bikeCollection.find(query).toArray();
  res.send(result);
});
// posting a product
app.post("/allBikes", async (req, res) => {
  const query = req.body;
  const result = await bikeCollection.insertOne(query);
  res.send(result);
});
// getAllBikesCollectionServiceByID
app.get("/allCategories/:CategoryName", async (req, res) => {
  const id = req.params.CategoryName;
  const query = { CategoryName: id };
  const serviceCategory = await bikeCollection.find(query).toArray();
  // console.log(serviceCategory)
  res.send(serviceCategory);
});
app.get("/productId/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const productId = await bikeCollection.find(query).toArray();
  // console.log(productId,"productID")
  res.send(productId);
});

app.get("/myProduct/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const myProduct = await bikeCollection.find(query).toArray();
  // console.log(myProduct, "productID");
  res.send(myProduct);
});

// gettingOrderByBooking

app.post("/booked", async (req, res) => {
  const query = req.body;
  const receivedOrderByBooking = await bookedCollection.insertOne(query);
  // console.log(receivedOrderByBooking)
  res.send(receivedOrderByBooking);
});

// fine total order by per user

app.get("/ordered/:email", async (req, res) => {
  const id = req.params.email;
  const query = { customerEmail: id };
  const receivedAllOrder = await bookedCollection.find(query).toArray();
  // console.log(receivedAllOrder)
  res.send(receivedAllOrder);
});

run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, (req, res) => {
  console.log(`dream bike is running ${port}`);
});
