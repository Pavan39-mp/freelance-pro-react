import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import {
    createPayment,
    getPayments,
    getInvoicePayments,
    deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect); // All payment routes are protected

router.route('/')
    .post(authorizeRoles('client'), createPayment)
    .get(getPayments);

router.route('/invoice/:invoiceId')
    .get(getInvoicePayments);

router.route('/:id')
    .delete(authorizeRoles('client'), deletePayment);

export default router;
