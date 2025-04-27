import express from "express";
import type { RequestHandler } from "express"; 
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAuthorized } from "./middlewares/authorization-middleware";


import { 
    getAllHotels, 
    getHotelById, 
    createHotel, 
    deleteHotel, 
    updateHotel,
    generateResponse 
} from "../application/hotel";
import {createEmbeddings} from "./embedding";
import { retrieve } from "./retrieve";

const hotelsRouter = express.Router();

hotelsRouter.route("/")
    .get(getAllHotels as RequestHandler)
    .post(isAuthenticated, isAuthorized, createHotel as RequestHandler);

hotelsRouter.route("/:id")
    .get(getHotelById as RequestHandler)
    .put(updateHotel as RequestHandler)
    .delete(deleteHotel as RequestHandler);

hotelsRouter.route("/embeddings/create").post(createEmbeddings as RequestHandler);
hotelsRouter.route("/search/retrieve").get(retrieve as RequestHandler);       

export default hotelsRouter;
