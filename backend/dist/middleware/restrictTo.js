import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
export const restrictTo = (...roles) => catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError("You are not logged in", 401));
    }
    if (!roles.includes(req.user.role)) {
        return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
});
//# sourceMappingURL=restrictTo.js.map