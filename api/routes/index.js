/**
 * This is routes index file.
 * It contains all the routes.
 */
import express from "express";

import userRoutes from "../routes/userRoutes";
const routes = express.Router();

//User Routes
routes.use("/user", userRoutes);

export default routes;
