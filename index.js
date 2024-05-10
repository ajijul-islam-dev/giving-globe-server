const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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