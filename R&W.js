const mongoose = require('mongoose');
const connectDB = require('./db'); // Assuming db.js exports the connectDB function

connectDB();

// Define a Mongoose schema and model
const crimeIncidentSchema = new mongoose.Schema({
    crime_id: String,
    crime_type: String,
    date: Date,
    description: String,
    location: {
        type: { location_type: String, enum: ['Point']}, // GeoJSON type
        coordinates: { type: [Number] } // Array of numbers
    },
    neighborhood: String,
    reported_by: String
});

// Create a model for the crime incidents
const CrimeIncident = mongoose.model('CrimeIncident', crimeIncidentSchema);

// Create a collection for crime incidents
async function createCrimeCollection() {
    await db.createCollection("crime_incidents");
    console.log("Collection 'crime_incidents' created");
}

// Insert a crime incident
async function insertCrimeIncident(crime_id, crime_type, date, description, loc_type, coordinates, neighborhood, reported_by) {
    const incident = new CrimeIncident({
        crime_id,
        crime_type,
        date,
        description,
        location: { location_type: loc_type, coordinates },
        neighborhood,
        reported_by
    });

    await incident.save(); // Use Mongoose to save the document
    console.log("Crime incident inserted");
}

// Returns all records within a given radius from a given point
// (and potentially within a given time interval)
async function recordsWithinRadius(point, radius, startDate = new Date('1964-09-28T00:00:00Z'), endDate = new Date()) {
    const records = await CrimeIncident.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: point },
                $maxDistance: radius
            }
        },
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();

    return records;
}

// Returns all records within a given geospatial polygon
// (and potentially within a given time interval)
async function recordsWithinPolygon(coordinateList, startDate = new Date('1964-09-28T00:00:00Z'), endDate = new Date()) {
    const records = await CrimeIncident.find({
        location: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: [coordinateList]
                }
            }
        },
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();

    return records;
}

// Returns all records within a given time interval
async function recordsWithinTime(startDate, endDate) {
    const records = await CrimeIncident.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();

    return records;
}