import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../lib/Prisma.js";

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
