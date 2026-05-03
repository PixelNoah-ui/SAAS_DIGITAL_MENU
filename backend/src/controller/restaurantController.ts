import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";
import { AppError } from "../utils/AppError.js";

export const getRestaurantInfo = catchAsync(async (req, res) => {
  let info = await prisma.restaurantInfo.findFirst();

  if (!info) {
    info = await prisma.restaurantInfo.create({
      data: {
        name: "My Restaurant",
        phone: "",
        address: "",
        room: "",
        telegramUsername: "",
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: { restaurant: info },
  });
});

export const updateRestaurantInfo = catchAsync(async (req, res, next) => {
  const { name, phone, address, telegramUsername } = req.body;

  console.log("BODY:", req.body);

  if (!name || !phone || !address || !telegramUsername) {
    return next(
      new AppError(
        "Please provide name, phone, address and telegramUsername",
        400,
      ),
    );
  }

  const restaurantInfo = await prisma.restaurantInfo.upsert({
    where: {
      id: "restaurant-singleton",
    },
    update: {
      name,
      phone,
      address,
      telegramUsername,
    },
    create: {
      id: "restaurant-singleton",
      name,
      phone,
      address,
      telegramUsername,
    },
  });

  res.status(200).json({
    success: true,
    data: { restaurantInfo },
  });
});
