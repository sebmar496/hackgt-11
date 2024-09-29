const express = require('express');
const app = express();
const {
    recordsWithinRadius,
    recordsWithinPolygon,
    recordsWithinTimeInterval
} = require("../database-interaction/read.js")
const { insertCrimeIncident, makeRecord } = require("../database-interaction/write.js")

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://sebmar496:wVQewJdHvE5pejeM@geoguard.1nuve.mongodb.net/?retryWrites=true&w=majority&appName=geoguard"
const client = new MongoClient(uri);
const collection = client.db("atlanta-crimes").collection("crime-incidents");
const dbName = "atlanta-crimes"

app.use(express.json());

// EXPECTED QUERY PARAMETERS:
// the name of the function followed by all parameters to that function
// example: GET /read?action=radius&point[]=33.765932&point[]=-84.394711&radius=500&startDate=null&params=null
// example: GET /read?action=polygon&points[]=33.765932&points[]=-84.394711&points[]=34.765932&points[]=-85.394711&points[]=35.765932&points[]=-86.394711&points[]=33.765932&points[]=-84.394711&startDate=null&params=null
app.get("/read", async (req, res) => {
    const { action, ...params} = req.query;

    try {
        if (action == "radius") {
            const point = [parseFloat(params.point[0]), parseFloat(params.point[1])];
            const radius = parseInt(params.radius);
            if (params.startDate != "null") {
                startDate = Date(params.startDate);
            } else {
                startDate = null;
            }
            if (params.endDate != null) {
                endDate = Date(params.endDate);
            } else {
                endDate = null;
            }
            const crimes = await recordsWithinRadius(collection, point, radius, startDate, endDate);
            res.json(crimes);
        } else if (action == "polygon") {
            var points = [];
            for (let i = 0; i < params.points.length; i+=2) {
                points.push([parseFloat(params.points[i]), parseFloat(params.points[i+1])]);
            }
            console.log(points);
            if (params.startDate != "null") {
                startDate = Date(params.startDate);
            } else {
                startDate = null;
            }
            if (params.endDate != null) {
                endDate = Date(params.endDate);
            } else {
                endDate = null;
            }
            const crimes = await recordsWithinPolygon(collection, points, startDate, endDate);
            res.json(crimes);
        } else if (action == "time") {
            if (params.startDate != "null") {
                startDate = Date(params.startDate);
            } else {
                startDate = null;
            }
            if (params.endDate != null) {
                endDate = Date(params.endDate);
            } else {
                endDate = null;
            }
            const crimes = await recordsWithinTimeInterval(collection, params.startDate, params.endDate);
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error processing request" });
    }
});

// example: GET /write?
app.post("/write", async (req, res) => {
    const params = req.query;

    try {
        const crime_id = parseInt(crime_id);
        if (params.date != "null") {
            date = Date(params.date);
        } else {
            date = null;
        }
        const coordinates = [parseInt(params.coordinates[0]), parseInt(params.coordinates[1])]
        const newRecord = makeRecord(crime_id, params.crime_type, date, params.description, coordinates, params.neighborhood);
        const insertedId = await insertCrimeIncident(newRecord);
        res.json({ insertedId });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error writing data' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});