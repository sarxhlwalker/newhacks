import dotenv from "dotenv";

dotenv.config();

import express from "express";
import _debug from "debug";
import path from "path";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import expressSession from "express-session";

const debug = _debug("localhost:server");

//Mongoose Models
import { userModel } from "./models/users";

//Initialize mongoose models
import mongoose, { Error, mongo } from "mongoose";

//Express routes
import { assignments_getRouter } from "./routes/assignments";
import { groups_getRouter } from "./routes/groups";
import { users_getRouter } from "./routes/users";

//Connect to atlas
mongoose.connect(process.env.CONNECTION_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as any);

const app = express();

//Basic express init
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../../WebApp/static")));

//Express sessions initialization: Note: add secret key to 'secret'.
let mySession = expressSession({
    secret: process.env.SESSION_KEY!,
    resave: true,
    saveUninitialized: true,
});
app.use(mySession);

//Use the express routes
app.use("/users", users_getRouter());
app.use("/groups", groups_getRouter());
app.use("/assignments", assignments_getRouter());

//CORS can be removed now, (added it during a dual server boot setup)
app.use(cors());

// Set port to normalize
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address()!;
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);

    // userModel.find().then((n) => {
    //     console.log(n);
    // });
}
