const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


// midlewares
app.use(cors());
app.use(express.json())



const uri = "mongodb+srv://azizulhaque:1LbTO3YpD3PGCXlh@cluster0.wugjgdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // server test
        app.get("/", async (req, res) => {
            res.send("data coming soon...")
        })


        // find first 6 data 
        app.get("/volunteerneednow", async(req,res)=>{
            const result = volunteerCollection.find().sort({deadline: 1}).limit(6);
            const final = await result.toArray()
            res.send(final)
        })

        // find all post data 
        app.get("/volunteerposts", async(req,res)=>{
            const cursor =  volunteerCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // find specific post by id 
        app.get("/volunteerpost/:id", async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await volunteerCollection.findOne(query);
            res.send(result);
        })

        // add post to database
        app.post("/addvolunteerpost", async(req,res)=>{
            const data = req.body;
            const result = await volunteerCollection.insertOne(data);
            res.send(result)
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