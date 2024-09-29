const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://sebmar496:wVQewJdHvE5pejeM@geoguard.1nuve.mongodb.net/?retryWrites=true&w=majority&appName=geoguard"
const client = new MongoClient(uri);

function makeRecord(
    crime_id, crime_type, date, description,
    coordinates, neighborhood
) {
    const record = {
        "crime_id": crime_id,
        "crime_type": crime_type,
        "date": date,
        "description": description,
        "coordinates": coordinates,
        "neighborhood": neighborhood
    }

    return record
}

async function insertCrimeIncident(record) {
    try {
        await client.connect();

        const database = client.db("atlanta-crimes");
        const collection = database.collection("crime-incidents");
        
        const result = await collection.insertOne(record);
        console.log(`New record created with the following id: ${result.insertedId}`);

        await collection.createIndex({ location: "2dsphere" });

    } catch (error) {
        console.error("Error inserting record: ", error);
    } finally {
        await client.close();
    }
}

module.exports = { insertCrimeIncident, makeRecord };