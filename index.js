const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const bcryptjs = require("bcryptjs")
const jsonwebtoken = require("jsonwebtoken")

const mongoClient = mongodb.MongoClient;
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const URL = "mongodb+srv://vasanth:admin123@cluster0.ni9t3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let users = [];

function authenticate(req,res,next){
  if(req.headers.authorization){
    let decoded = jsonwebtoken.verify(req.headers.authorization, 'dasjkdbiahsd');
    if(decoded){
      next()
    }else{
      res.status(401).json({message : "Not Allowed"})
    }
  }else{
    res.status(401).json({message : "Not Allowed"})
  }
  // next()
}

app.get("/users",authenticate, async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    // Select Collection
    // DO operation
    let students = await db.collection("students").find().toArray();

    // Close Connection
    await connection.close();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Something Went wrong" });
  }
});

app.post("/create-user",authenticate, async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

   
    await db.collection("students").insertOne(req.body);

    // Close Connection
    await connection.close();

    res.json({ message: "User Created in db" });
  } catch (error) {
    res.status(500).json({ message: "Something Went wrong" });
  }

 
});

app.get("/user/:id",authenticate, async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    let students = await db
      .collection("students")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    // Close Connection
    await connection.close();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Something Went wrong" });
  }


});

app.put("/edit/:id",authenticate, async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    
    await db.collection("students").findOneAndUpdate(
      { _id: mongodb.ObjectId(req.params.id) },
      { $set: req.body }
    );

    // Close Connection
    await connection.close();

    res.json({ message: "User updated" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went wrong" });
  }

 
});

app.delete("/delete/:id",authenticate, async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    await db.collection("students").findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) })

    // Close Connection
    await connection.close();

    res.json({ message: "User Deleted" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went wrong" });
  }

 
});



app.post("/register", async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    // Select Collection
    // DO operation

    // Encrypt the password
    let salt = await bcryptjs.genSalt(10)
    let hash = await bcryptjs.hash(req.body.password, salt)

    req.body.password = hash

    await db.collection("users").insertOne(req.body)

    // Close Connection
    await connection.close();

    res.json({ message: "User Registered" });
  } catch (error) {
    res.status(500).json({ message: "Something Went wrong" });
  }
})

app.post("/login", async function (req, res) {
  try {
    // Connect the DB
    let connection = await mongoClient.connect(URL);

    // Select DB
    let db = connection.db("b31wd");

    // Select Collection
    // DO operation
    let user = await db.collection("users").findOne({ email: req.body.email });

    if (user) {
      let compare = await bcryptjs.compare(req.body.password, user.password);
      if (compare) {
        // Generate the token
        let token = jsonwebtoken.sign({id : user._id},"dasjkdbiahsd",{ expiresIn: '1m' })
        res.json({token})
      } else {
        res.status(401).json({ message: "Incorrect Password" })
      }
    } else {
      res.status(404).json({ message: "User not found" })
    }
    // Close Connection
    await connection.close();
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went wrong" });
  }
})


app.listen(process.env.PORT || 3001);