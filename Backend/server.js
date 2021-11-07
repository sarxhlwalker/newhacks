require("dotenv").config();

const express = require("express");
const debug = require("debug")("localhost:server");
const path = require("path");
const bodyParser = require("body-parser");

const cors = require("cors");
const http = require("http");

//Mongoose Models
const userModel = require("./models/users");

//Initialize mongoose models
const mongoose = require("mongoose");

//Express routes
const usersRouter = require("./routes/users");
const groupsRouter = require('./routes/groups');

//Connect to atlas
mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

//Basic express init
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../WebApp/static")));

//Express sessions initialization: Note: add secret key to 'secret'.
let my_session = require("express-session")({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
});
app.use(my_session);

//Use the express routes
app.use("/users", usersRouter);
app.use('/groups', groupsRouter);

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

function normalizePort(val) {
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

function onError(error) {
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
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);
}
