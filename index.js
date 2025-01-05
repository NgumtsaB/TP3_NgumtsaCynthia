import express from "express";
import cors from "cors";
import artistAPI from "./APIs/Artist.js";
import userAPI from "./APIs/User.js";
import ratingAPI from "./APIs/ratings.js";
import followAPI from "./APIs/Follow.js";

const app = express();

// Middleware Setup
app.use(express.json());
app.use(cors());

// Route handlers
app.use("/artists", artistAPI);
app.use("/profiles", userAPI);
app.use("/reviews", ratingAPI);
app.use("/follow", followAPI)


// Root endpoint to welcome users
app.get("/", (req, res) => {
  res.send("Hello, welcome to the service!");
});

// Run the server on a specific port
app.listen(4000, () => {
  console.log("Server is running at http://localhost:4000");
});
