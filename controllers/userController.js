import Tax from '../models/taxModel.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const setMe = (req, res, next) => {
  req.params.id = req.user.dataValues.id;
  next();
};

//Update user tax info- mark tax as paid after payment processing
export const payMyTax = catchAsync(async (req, res, next) => {
  const tax = await Tax.findByPk(req.params.id);

  if (tax.isPaid) {
    return next(new AppError('Tax is paid, cannot update', 403));
  }

  const [, [updatedTax]] = await Tax.update(
    { isPaid: true },
    {
      where: {
        id: req.params.id,
      },
      returning: true,
    }
  );

  if (!tax) {
    return next(new AppError('No tax found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedTax,
  });
});
