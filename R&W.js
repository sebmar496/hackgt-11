db.createCollection("crime_incidents")

// This can change
earliestDate = ISODate("1964-09-28T00:00:00Z")

function insertCrimeIncident(
    crime_id, crime_type, date, description,
    location, loc_type, coordinates, neighborhood, reported_by
) {
    db.crime_incidents.insert({
        "crime_id": crime_id,
        "crime_type": crime_type,
        "date": date,
        "description": description,
        "location": {"type": loc_type, "coordinates": coordinates},
        "neighborhood": neighborhood,
        "reported_by": reported_by
    })

    db.crime_incidents.createIndex({ "location": "2dsphere" })
}

// Returns all records within a given radius from a given point
// (and potentially within a given time interval)
function recordsWithinRadius(point, radius, startDate=earliestDate, endDate=ISODate()) {
    records = db.crime_incidents.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: point },
                $maxDistance: radius // distance in meters
            }
        },

        date: {
            $gte: startDate,
            $lte: endDate
        }
    })

    return records
}

// Returns all records within a given geospatial polygon
// (and potentially within a given time interval)
function recordsWithinPolygon(coordinateList, startDate=earliestDate, endDate=ISODate()) {
    records = db.crime_incidents.find({
        location: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: [
                        [coordinateList]
                    ]
                }
            }
        },

        date: {
            $gte: startDate,
            $lte: endDate
        }
    })

    return records
}

// Returns all records within a given time interval
function recordsWithinTime(startDate, endDate) {
    records = db.crime_incidents.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    })

    return records
}