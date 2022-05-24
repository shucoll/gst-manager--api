import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

import User from '../models/userModel.js';
import Tax from '../models/taxModel.js';
import TaxPayer from '../models/taxPayerModel.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  user.password = undefined;
  user.email = undefined;
  user.passwordConfirm = undefined;
  user.role = undefined;

  // const cookieOptions = {
  //   path: '/',
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //converts to days
  //   ),
  //   httpOnly: true,
  // };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

const correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.scope('allFields').findOne({
    where: {
      email: email,
    },
  });
  if (!user || !(await correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'null') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.scope('allFields').findOne({
    where: {
      id: decoded.id,
    },
  });
  // console.log(currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  currentUser.password = undefined;

  req.user = currentUser;

  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.dataValues.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

export const restrictToSelf = (model) =>
  catchAsync(async (req, res, next) => {
    let Model;

    if (model === 'tax') {
      Model = Tax;
    }

    const doc = await Model.findByPk(req.params.id);

    if (!doc) {
      return next(new AppError('No tax with that id', 400));
    }

    if (model === 'tax') {
      const taxPayer = await TaxPayer.findByPk(doc.taxPayerId);
      doc.userId = taxPayer.userId;
    }

    if (!(doc.userId === req.user.dataValues.id)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  });
