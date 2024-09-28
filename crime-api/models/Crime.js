const mongoose = require('center')

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

CrimeSchema.index({ location: '2dsphere' }); // Enable geospatial queries

module.exports = mongoose.model('Crime', CrimeSchema);