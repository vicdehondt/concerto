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
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credential: "include",
    optionsSuccessStatus: 204
}

export function getCorsConfiguration() {
    return cors(corsOptions);
}