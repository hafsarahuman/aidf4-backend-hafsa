import { Request, Response, NextFunction } from "express";
import Booking from "../Infrastructure/schemas/Booking";
import Hotel from "../Infrastructure/schemas/Hotel";
import { CreateBookingDTO } from "../domain/dtos/booking";
import { clerkClient } from "@clerk/express";
import NotFoundError from "../domain/errors/NotFoundError";
import ValidationError from "../domain/errors/ValidationError";
import mongoose from "mongoose";


// ✅ CREATE BOOKING
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = CreateBookingDTO.safeParse(req.body);
    if (!booking.success) {
      throw new ValidationError(booking.error.message);
    }

    const user = req.auth;
    const { hotelId, checkIn, checkOut } = booking.data;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new ValidationError("Invalid check-in/check-out dates");
    }

    if (checkInDate >= checkOutDate) {
      throw new ValidationError("Check-out must be after check-in");
    }

    // Generate room number
    const roomNumber = await (async () => {
      let roomNumber;
      let isRoomAvailable = false;
      while (!isRoomAvailable) {
        roomNumber = Math.floor(Math.random() * 1000) + 1;
        const existingBooking = await Booking.findOne({
          hotelId,
          roomNumber,
          $or: [
            { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } },
          ],
        });
        isRoomAvailable = !existingBooking;
      }
      return roomNumber;
    })();

    const newBooking = await Booking.create({
      hotelId,
      userId: user?.userId,
      checkIn,
      checkOut,
      roomNumber,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

// ✅ GET A BOOKING BY ID
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.params;

    // Check if bookingId exists
    if (!bookingId) {
      throw new ValidationError("Booking ID is required");
    }

    // Check if bookingId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new ValidationError("Invalid Booking ID format");
    }

    // Fetch booking and populate related hotel
    const booking = await Booking.findById(bookingId).populate("hotelId");

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// ✅ GET ALL BOOKINGS (ADMIN)
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find().populate("hotelId");
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// ✅ GET ALL BOOKINGS FOR A SPECIFIC HOTEL
export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotelId });

    const bookingsWithUser = await Promise.all(
      bookings.map(async (el) => {
        const user = await clerkClient.users.getUser(el.userId);
        return {
          _id: el._id,
          hotelId: el.hotelId,
          checkIn: el.checkIn,
          checkOut: el.checkOut,
          roomNumber: el.roomNumber,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      })
    );

    res.status(200).json(bookingsWithUser);
  } catch (error) {
    next(error);
  }
};
