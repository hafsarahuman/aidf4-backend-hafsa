import { NextFunction, Request, Response } from "express";
import Hotel from "../Infrastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/NotFoundError";
import ValidationError from "../domain/errors/ValidationError";
import { CreateHotelDTO } from "../domain/dtos/hotel";

import OpenAI from 'openai';
import stripe from "../Infrastructure/stripe";


/*const hotels = [
  {
    id: "1",
    name: "Tokyo Tower Inn",
    location: "Tokyo, Japan",
    rating: 4.7,
    reviews: 2578,
    price: 180,
    image: "https://i.pinimg.com/474x/3d/5c/91/3d5c918dac9e374275c7235a22631961.jpg",
    country: "Japan",
    description: "Discover the vibrant energy of Tokyo at Tokyo Tower Inn, located in the heart of Japan’s bustling capital. For $180 per night, guests can enjoy modern comforts, panoramic city views, and access to iconic attractions like Shibuya Crossing and the Imperial Palace. Ideal for foodies, tech enthusiasts, and urban explorers.",
  },
  {
    id: "2",
    name: "Montmartre Majesty Hotel",
    location: "Paris, France",
    rating: 4.9,
    reviews: 1240,
    price: 160,
    image: "https://i.pinimg.com/474x/6c/53/7e/6c537e49445ef2490b822e37e64f45dc.jpg",
    country: "France",
    description: "Stay in the heart of Paris, France, at the Montmartre Majesty Hotel, where elegance meets charm. Perfect for exploring iconic landmarks like the Eiffel Tower and the Louvre, this hotel offers a tranquil escape from the bustling city. With luxurious rooms starting at $160 per night, enjoy breathtaking rooftop views, exquisite French cuisine, and the romantic ambiance of Montmartre. Ideal for a dreamy city getaway.",
  },
  {
    id: "3",
    name: "Loire Luxury Lodge",
    location: "Sydney, Australia",
    rating: 2.9,
    reviews: 1298,
    price: 350,
    image: "https://i.pinimg.com/474x/43/84/d1/4384d1dce8ac1b3f2cf62e3e17467cbf.jpg",
    country: "Australia",
    description: "Overlooking Sydney Harbour, Loire Luxury Lodge provides unmatched waterfront views and a vibrant city experience. From $350 per night, relax in modern luxury while enjoying proximity to Sydney Opera House and Bondi Beach. Whether you’re seeking adventure or relaxation, this hotel offers a harmonious blend of urban excitement and tranquil sophistication.",
  },
  {
    id: "4",
    name: "Sydney Harbour Hotel",
    location: "Sydney, Australia",
    rating: 3.9,
    reviews: 2541,
    price: 200,
    image: "https://i.pinimg.com/474x/80/0a/f0/800af0101b474de67b3d36ea7cac4711.jpg",
    country: "Australia",
    description: "Stay at Sydney Harbour Hotel and wake up to stunning harbour views in one of Australia’s most iconic destinations. Starting at $200 per night, enjoy rooftop dining, modern facilities, and close proximity to Darling Harbour and Sydney’s vibrant nightlife. Ideal for couples and city adventurers.",
  },
  {
    id: "5",
    name: "Milan Central Suites",
    location: "Milan, Italy",
    rating: 4.1,
    reviews: 3240,
    price: 140,
    image: "https://i.pinimg.com/474x/b4/e4/4b/b4e44bf808d35a4a1eb9899e8ca3df0e.jpg",
    country: "Italy",
    description: "Nestled in the fashion capital of Milan, Italy, Milan Central Suites combines style and comfort for an unforgettable stay. At $140 per night, enjoy proximity to the Duomo and Galleria Vittorio Emanuele II, making it perfect for shoppers and culture enthusiasts alike.",
  },
  {
    id: "6",
    name: "Elysee Retreat",
    location: "Kyoto, Japan",
    rating: 4.8,
    reviews: 1256,
    price: 150,
    image: "https://i.pinimg.com/474x/70/35/a9/7035a9eef425afbb078a99f4f08309d1.jpg",
    country: "Japan",
    description: "Immerse yourself in Kyoto’s serene beauty at Elysée Retreat, a sanctuary of peace and tradition. Discover the charm of Japanese gardens, historic temples, and tea ceremonies, all just steps away. For $150 per night, indulge in authentic Kyoto hospitality, minimalistic elegance, and an unforgettable cultural experience tailored for nature lovers and tranquility seekers.",
  },
  {
    id: "7",
    name: "Versailles Vista Inn",
    location: "Rome, Italy",
    rating: 4.5,
    reviews: 2908,
    price: 220,
    image: "https://i.pinimg.com/474x/3a/b4/83/3ab483136d2f1257b72e615d49e3e37b.jpg",
    country: "Italy",
    description: "Located in the historic heart of Rome, Italy, Versailles Vista Inn offers a touch of Renaissance luxury. Explore the Colosseum and Vatican City by day and retreat to opulent comfort at night. Starting at $220 per night, guests enjoy fine Italian dining, elegant interiors, and a prime location for experiencing Rome’s timeless culture. Ideal for history buffs and luxury seekers.",
  },
  {
    id: "8",
    name: "Parisian Palace",
    location: "Paris, France",
    rating: 4.7,
    reviews: 1550,
    price: 320,
    image: "https://i.pinimg.com/474x/a4/2c/a8/a42ca886a68a566b6b93cbfe00f24096.jpg",
    country: "France",
    description: "Experience ultimate luxury at Parisian Palace, a gem in the heart of Paris, France. For $320 per night, immerse yourself in timeless elegance with grand interiors, Michelin-star dining, and breathtaking views of the Seine. Perfect for a romantic escape or a refined city retreat.",
  },
  {
    id: "9",
    name: "Fairway Hotel",
    location: "Colombo, Srilanka",
    rating: 3.2,
    reviews: 2400,
    price: 220,
    image: "https://i.pinimg.com/474x/77/d1/74/77d17473cf4f1c3eb5aec7e381930025.jpg",
    country: "Srilanka",
    description: "lorel",
  },
];*/


// Get all hotels
export const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await Hotel.find({});
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};




// Get a hotel by ID
export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    res.status(200).json(hotel);
  } catch (error) {
      next(error);
    }
};

//AI Generation part

export const generateResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const message = completion.choices[0].message.content;
    console.log(message);

    //  Send response back to client
    res.json({ response: message });

  } catch (error) {
    console.error("Error in LLM response:", error);
    res.status(500).json({ error: "LLM generation failed" });
  }
};



// Create a new hotel
export const createHotel = async (req: Request, res: Response) => {
  try {
    // Validate input using Zod schema
    const validationResult = CreateHotelDTO.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: "Invalid hotel data",
        errors: validationResult.error.format(),
      });
      return;
    }

    const hotelData = validationResult.data;

    // Create a product in Stripe
    const stripeProduct = await stripe.products.create({
      name: hotelData.name,
      description: hotelData.description,
      default_price_data: {
        unit_amount: Math.round(hotelData.price * 100), // ✅ Multiply directly if already number Convert to cents
        currency: "usd",
      },
    });

    // Ensure the product creation was successful
    if (!stripeProduct || !stripeProduct.default_price) {
      return res.status(500).json({ message: "Failed to create Stripe product" });
    }

    // Create the hotel with the Stripe price ID
    const hotel = new Hotel({
      name: hotelData.name,
      location: hotelData.location,
      image: hotelData.image,
      price: Number(hotelData.price),
      description: hotelData.description,
      stripePriceId: stripeProduct.default_price,
    });

    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    console.error("Error creating hotel:", error);
    res.status(500).json({
      message: "Failed to create hotel",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Delete a hotel
export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const deletedHotel = await Hotel.findByIdAndDelete(hotelId);

    if (!deletedHotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update a hotel
export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const updatedHotel = req.body;

    if (
      !updatedHotel.name ||
      !updatedHotel.location ||
      !updatedHotel.rating ||
      !updatedHotel.reviews ||
      !updatedHotel.image ||
      !updatedHotel.price ||
      !updatedHotel.description
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hotel = await Hotel.findByIdAndUpdate(hotelId, updatedHotel, { new: true });

    if (!hotel) {
      throw new ValidationError("Invalid Hotel data");
    }

    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};
