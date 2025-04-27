import express from "express";
import { createBooking, getAllBookingsForHotel, getAllBookings, getBookingById, } from "../application/booking";
import { isAuthenticated } from "./middlewares/authentication-middleware";

const bookingsRouter = express.Router();

bookingsRouter.route("/").post(isAuthenticated, createBooking).get(isAuthenticated, getAllBookings);
bookingsRouter.route("/hotels/:hotelId").get(isAuthenticated,getAllBookingsForHotel);
bookingsRouter.route("/:bookingId").get(isAuthenticated, getBookingById);


export default bookingsRouter;
