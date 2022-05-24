import express from 'express';

import * as taxController from '../controllers/taxController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo('admin', 'tax-accountant'));

router.get('/all-taxes', taxController.getAllTaxes);

router.use(authController.restrictTo('tax-accountant'));

router.post('/create-tax', taxController.createTax);
router.patch('/update-tax/:id', taxController.updateUserTax);

export default router;
