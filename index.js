const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://assignment-11-1edee.web.app"
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(402).send({ message: 'unauthorized' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(402).send({ message: 'unAthorized' })
        }
        req.user = decoded;
        next();

    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wugjgdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const database = client.db("VolunteerDB");
        const volunteerCollection = database.collection("VolunteerCollection");
        const requestedDatabase = client.db("requestedPostDB");
        const requestedCollection = requestedDatabase.collection("requestedPostCollection");

        // server test
        app.get("/", (req, res) => {
            res.send("data coming soon...")
        })

        // jwt token
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1h"
            })
            res.cookie("token", token, {
                httpOnly: false,
                secure: true,
                sameSite: 'none'
            }).send({ success: true })
        })

        // find first 6 data 
        app.get("/volunteerneednow", async (req, res) => {
            const result = volunteerCollection.find().sort({ deadline: 1 }).limit(6);
            const final = await result.toArray()
            res.send(final)
        })

        // find all post data 
        app.get("/volunteerposts", async (req, res) => {
            const cursor = volunteerCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // find specific post by id 
        app.get("/volunteerpost/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await volunteerCollection.findOne(query);
            res.send(result);
        })

        // add post to database
        app.post("/addvolunteerpost", async (req, res) => {
            const data = req.body;
            const result = await volunteerCollection.insertOne(data);
            res.send(result)
        })

        // find my posts
        app.get("/myposts", verifyToken, async (req, res) => {
            const email = req.query.email;
            if(email !== req.user.email){
                return res.status(402).send({message : "forbidden"})
            }
            const query = { organizer_email: email };
            const cursor = volunteerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // post requested volunteer 
        app.post("/requestedpost", async (req, res) => {
            const data = req.body;
            const result = await requestedCollection.insertOne(data);
            res.send(result);
        })

        // get requested volunteer 
        app.get("/requestedpost", verifyToken,async (req, res) => {
            const email = req.query.email;
            if(req.user.email !== email){
                return res.status(403).send({message: "forrrrrrbidden"})
            }
            const query = { volunteer_email: email };
            const result = await requestedCollection.find(query).toArray();
            res.send(result);
        })

        // delete requested post
        app.delete("/requestedpost/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await requestedCollection.deleteOne(query);
            res.send(result);
        })

        // delete post
        app.delete("/mypost/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await volunteerCollection.deleteOne(query);
            res.send(result);
        })

        // update post
        app.put("/mypost/update/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    thumbnail: data.thumbnail,
                    post_title: data.post_title,
                    description: data.description,
                    category: data.category,
                    location: data.location,
                    volunteers_needed: data.volunteers_needed,
                    organizer_name: data.organizer_name,
                    organizer_email: data.organizer_email,
                    deadline: data.deadline
                }
            }
            const result = await volunteerCollection.updateOne(query, updatedData, options)
            res.send(result)
        })

        // update a posts volunterr count  decrease
        app.patch("/volunteerpost/decrease/:id", async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const updatedDoc = {
                $inc: { volunteers_needed: -1 }
            }
            const result = await volunteerCollection.updateOne(query,updatedDoc)
            res.send(result);
        })

        
        // search functionality
        app.get("/mypost/search", async (req, res) => {
            const title = req.query.text;
            const query = { post_title: { $regex: title } }
            const cursor = volunteerCollection.find(query);
            const result = await cursor.toArray();
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

app.listen(port, () => {
    console.log(`server Running On Port ${port}`);
})
