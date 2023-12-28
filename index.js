import express from "express";
import bootstrap from "./src/bootstrap.js";
import "dotenv/config";
const app = express();
bootstrap(app, express);
const server = app.listen(3000, () => {
  console.log("server running on port 3000");
});
