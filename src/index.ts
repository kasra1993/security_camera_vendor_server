import express from "express";
import cors from "cors";
import http from "http";
import https from "https";
import fs from "fs";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
// import dotenv from "dotenv";

import router from "./router";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.static("public"));

app.use(compression());
app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const httpsServer = https.createServer(
  {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/server.securitycameravendor.com/privkey.pem"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/server.securitycameravendor.com/fullchain.pem"
    ),
  },
  app
);
httpsServer.listen(8080, () => {
  console.log("server running on http://localhost:8080/");
  console.log("working great");
});
const httpServer = http.createServer(app);
httpServer.listen(8080, () => {
  console.log("server running on http://localhost:8080/");
  console.log("working great");
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL!);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/server", router());
