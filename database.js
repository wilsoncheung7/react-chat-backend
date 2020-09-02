// Create database
// const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost:27017/reactchat";

// MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
//     if (err) throw err;
//     console.log('Database created');
//     db.close();
// })

const MongoClient = require('mongodb');
const url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
    if (err) throw err;
    const dbo = db.db('reactchat');
    // Create Collection
    // dbo.createCollection('users', (err, res) => {
    //     if (err) throw err;
    //     console.log('Collection created');
    //     db.close();
    // })
    const query = { name: 'Wilson' };
    dbo.collection('users').find(query).toArray((err, result) => {
        if (err) throw err;
        console.log(result);
        db.close();
    })
})