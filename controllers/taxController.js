import * as factory from './handlerFactory.js';
import Tax from '../models/taxModel.js';
import TaxPayer from '../models/taxPayerModel.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Logic of fines not implemented.
const calculateTaxDue = (cgst, sgst, igst, taxableAmt) => {
  let cgstAmt;
  let igstAmt;
  let sgstAmt;
  cgstAmt = 0;
  igstAmt = 0;
  sgstAmt = 0;

  if (cgst > 0) cgstAmt = (taxableAmt * cgst) / 100;
  if (igst > 0) igstAmt = (taxableAmt * igst) / 100;
  if (sgst > 0) sgstAmt = (taxableAmt * sgst) / 100;

  const totalTaxDue = cgstAmt + igstAmt + sgstAmt;

  return totalTaxDue;
};

// Get all the taxes
export const getAllTaxes = factory.getAll(Tax);

// Create new tax by accountant
export const createTax = catchAsync(async (req, res, next) => {
  const { cgst, igst, sgst, dueDate, taxableAmt } = req.body.taxInfo;

  const { panNum } = req.body.taxPayerInfo;

  const taxPayerDoc = await TaxPayer.findOne({
    where: {
      panNum,
    },
  });

  if (!taxPayerDoc) {
    return next(new AppError('No tax payer found with that ID', 404));
  }

  const totalTaxDue = calculateTaxDue(cgst, sgst, igst, taxableAmt);

  const taxDoc = await Tax.create({
    cgst,
    igst,
    sgst,
    dueDate,
    taxableAmt,
    totalTaxDue,
    taxPayerId: taxPayerDoc.dataValues.id,
  });

  res.status(200).json({
    status: 'success',
    data: taxDoc,
  });
});

export const updateUserTax = catchAsync(async (req, res, next) => {
  const tax = await Tax.findByPk(req.params.id);

  if (tax.isPaid) {
    return next(new AppError('Tax is paid, cannot update', 403));
  }

  const { cgst, igst, sgst, dueDate, taxableAmt } = req.body;

  const totalTaxDue = calculateTaxDue(cgst, sgst, igst, taxableAmt);

  const [, [updatedTax]] = await Tax.update(
    {
      cgst,
      igst,
      sgst,
      dueDate,
      taxableAmt,
      totalTaxDue,
    },
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
