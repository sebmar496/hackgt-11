const earliestDate = Date("2022-01-01");


async function recordsWithinRadius(collection, point, radius, startDate=earliestDate, endDate=Date()) {
    try {
        const incidents = await collection.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: point
                    },
                    $maxDistance: radius
                }
            },

            date: {
                $gte: startDate,
                $lte: endDate
            }

        }).toArray();

        return incidents;

    } catch (error) {
        console.error(error);
    }
}

async function recordsWithinPolygon(collection, points, startDate=earliestDate, endDate=Date()) {
    try {
        const incidents = await collection.find({
            location: {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: [points]
                    }
                }
            },

            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).toArray();

        return incidents;

    } catch (error) {
        console.error(error);
    }
}

async function recordsWithinTimeInterval(collection, startDate=earliestDate, endDate=Date()) {
    try {
        const incidents = await collection.find({
            
            date: {
                $gte: startDate,
                $lte: endDate
            }

        }).toArray();

        return incidents;

    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    recordsWithinRadius,
    recordsWithinPolygon,
    recordsWithinTimeInterval
};