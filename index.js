const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1dxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("tourWithImriaz");
        const packagesCollection = database.collection('packages');
        const ordersCollection = database.collection('orders');

        //GET API for Get all Service
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //Add Tour Package API
        app.post('/addPackage', async (req, res) => {
            const package = req.body;
            console.log(package);
            const result = await packagesCollection.insertOne(package);
            res.send(result);
        });

        //ADD Order by POST Method
        app.post('/orders', async (req, res) => {
            const orderPackage = req.body;
            console.log(orderPackage);
            const result = await ordersCollection.insertOne(orderPackage);
            res.send(result);
        });

        //GET my Orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //Get API for Manage All Order
        app.get('/manageAllOrder', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        //DELETE Ordered Package
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(id);
            const result = await ordersCollection.deleteOne(query);
            console.log("Deleting user with id ", result);
            res.send(result);
        });

        //Update Order Status for single Order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);

            console.log('Updating Status', id);
            res.json(result)
            //console.log(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Travel with Imriaz Server Running");
})

app.listen(port, () => {
    console.log('Server running on Port: ', port);
})