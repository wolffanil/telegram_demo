require("dotenv").config();
require("express-async-errors");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/connect");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authMiddleware = require("./middleware/authentication");

// Routers
const authRouter = require("./routes/auth");
const fileRouter = require("./routes/file");
const chatRouter = require("./routes/chat");
const userRouter = require("./routes/user");
const friendRequestRouter = require("./routes/request");
const deviceRouter = require("./routes/device");

// Import socket handler
const handleSocketConnection = require("./controllers/sockets");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

// Attach the WebSocket instance to the request object
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Initialize the WebSocket handling logic
handleSocketConnection(io);

// Routes
app.use("/oauth", authRouter);
app.use("/file", fileRouter);
app.use("/request", authMiddleware, friendRequestRouter);
app.use("/user", authMiddleware, userRouter);
app.use("/chat", authMiddleware, chatRouter);
app.use("/device-token", authMiddleware, deviceRouter);

// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on port http://localhost:${
          process.env.PORT || 3000
        }`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
