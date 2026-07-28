import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import {
    getInvoices,
    getRevenueSummary,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
    changeStatus,
    getClientInvoices
} from '../controllers/invoiceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.get('/summary', getRevenueSummary);
router.get('/client/:clientId', getClientInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorizeRoles('client'), createInvoice);
router.put('/:id', authorizeRoles('client'), updateInvoice);
router.delete('/:id', authorizeRoles('client'), deleteInvoice);
router.post('/:id/duplicate', authorizeRoles('client'), duplicateInvoice);
router.patch('/:id/status', authorizeRoles('client'), changeStatus);

export default router;
