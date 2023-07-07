
const { Client } = require('@googlemaps/google-maps-services-js');
const axios = require('axios');
const client = new Client({});
const ApiError = require("./ApiError")
const qs = require('qs');

const paramsSerializer = (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' });
}


exports.calcDistance = async (origin, destination) => {
    try {
        const response = await client.distancematrix({
            params: {
                origins: [origin],
                destinations: [destination],
                key: 'AIzaSyCewVD8Afv0cy6NGoCZkQ4PZRW3OQCFfHA'
            },
            timeout: 1000,
            paramsSerializer: paramsSerializer
        });
        const { status, rows } = response.data;
        if (status === 'OK' && rows.length > 0) {
            const { elements } = rows[0];

            if (elements.length > 0) {
                const distance = elements[0].distance ?  elements[0].distance.text : false
                return distance;
            }
        }

        return null;
    } catch (error) {
        throw new ApiError(error.message, error.statusCode);
    }
};


exports.getLocationName = async (latitude, longitude) => {
    let location;
    try {
        await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${latitude},${longitude}`,
                key: "AIzaSyCewVD8Afv0cy6NGoCZkQ4PZRW3OQCFfHA"
            }
        }).then((response) => {
            const results = response.data.results;
            if (results.length > 0) location = results[0].formatted_address;
        })
        return location
    } catch (e) {
        throw new ApiError(e.message, e.statusCode)
    }
};



exports.getLatLongLocation = async (city) => {
    let location;
    await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
            query: city,
            key: 'AIzaSyCewVD8Afv0cy6NGoCZkQ4PZRW3OQCFfHA'
        }
    }).then(response => {
        const results = response.data.results;
        if (results.length > 0) {
            location = results[0].geometry.location
            return location
        }
    })
    return location
}