const { insertCrimeIncident } = require("./write.js")

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

async function run() {
    const newRecord = makeRecord(0, "larceny", Date(), "bad guy stole stuff", [-42.1, 25.2], "Atlantic Station");

    try {
        await insertCrimeIncident(newRecord);
        console.log("record write successful");
    } catch (error) {
        console.error("Failed to insert record:", error);
    }
}

run();