import express from 'express';

import * as userController from '../controllers/userController.js';
import * as taxController from '../controllers/taxController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.login);

router.use(authController.protect);

router.get('/my-taxes', userController.setMe, taxController.getAllTaxes);

router.patch(
  '/pay-my-tax/:id',
  authController.restrictToSelf('tax'),
  userController.payMyTax
);

export default router;
