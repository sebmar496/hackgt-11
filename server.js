const express = require('express');
const connectDB = require('./db')
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

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

// Insert a crime incident
app.post('/api/crime', async (req, res) => {
    const incident = req.body;
    try {
        const result = await CrimeIncident.create(incident);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get records within a radius
app.get('/api/crime/radius', async (req, res) => {
    const { longitude, latitude, radius, startDate, endDate } = req.query;
    const point = [parseFloat(longitude), parseFloat(latitude)];
    const records = await recordsWithinRadius(point, parseFloat(radius), new Date(startDate), new Date(endDate));
    res.send(records);
});

// Helper function to find records within a radius
async function recordsWithinRadius(point, radius, startDate, endDate) {
    return await CrimeIncident.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: point },
                $maxDistance: radius,
            }
        },
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});