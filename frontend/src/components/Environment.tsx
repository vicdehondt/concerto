
// Get the domain name of the backend server based on the environment variable given on start.
// yarn dev -> localhost:8080
// yarn start -> api.concerto.dehondt.dev
export const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}