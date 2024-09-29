const {
    recordsWithinRadius,
    recordsWithinPolygon,
    recordsWithinTimeInterval
} = require("./read.js");

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://sebmar496:wVQewJdHvE5pejeM@geoguard.1nuve.mongodb.net/?retryWrites=true&w=majority&appName=geoguard";
const client = new MongoClient(uri);

const collection = client.db("atlanta-crimes").collection("crime-incidents");

async function run() {
    // test method #1
    try {
        var records1 = await recordsWithinRadius(collection, [33.765932, -84.394711], 500);
        console.log(records1);
    } catch (error) {
        console.error("Failed test #1:", error);
    }

    // test method #2
    try {
        var records2 = await recordsWithinPolygon(collection, [[33.765932, -84.394711], [33.769433, -84.392827], [33.765777, -84.388000], [33.765932, -84.394711]]);
        console.log(records2);
    } catch (error) {
        console.error("Failed test #2:", error);
    }


    // test method #3
    try {
        var records3 = await recordsWithinTimeInterval(collection, Date("2024-08-28"), Date("2024-09-28"));
        console.log(records3);
    } catch (error) {
        console.error("Failed test #3:", error);
    }
}

run();