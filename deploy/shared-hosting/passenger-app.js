/**
 * CloudLinux / LiteSpeed Passenger entry for the Nest API.
 * PassengerBaseURI is /api, so Nest runs without an extra /api prefix.
 */
process.env.PASSENGER_BASE_URI = process.env.PASSENGER_BASE_URI || '/api';
process.env.API_GLOBAL_PREFIX = process.env.API_GLOBAL_PREFIX || '';
process.env.API_HOST = process.env.API_HOST || '127.0.0.1';

require('./dist/main.js');
