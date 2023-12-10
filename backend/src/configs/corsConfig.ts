const cors = require("cors");

export const environment = {
    frontendURL: "http://localhost:3000",
    domain: "localhost",
}
if (process.env.NODE_ENV == "production") {
    environment.frontendURL = "https://concerto.dehondt.dev"
    environment.domain = "concerto.dehondt.dev"
}
const corsOptions = {
    // https://www.npmjs.com/package/cors
    origin: environment.frontendURL,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}

export function getCorsConfiguration() {
    return cors(corsOptions);
}