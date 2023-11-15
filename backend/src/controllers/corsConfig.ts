const cors = require("cors");

const environment = {
    frontendURL: "http://localhost:3000"
}
if (process.env.NODE_ENV == "production") {
    environment.frontendURL = "http://concerto.dehondt.dev"
}
const corsOptions = {
    // https://www.npmjs.com/package/cors
    "origin": environment.frontendURL,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

export function getCorsConfiguration() {
    return cors(corsOptions);
}