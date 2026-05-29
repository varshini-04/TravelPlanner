import { Router } from 'express';
import { createTrip, getTrips, getTripById, updateTripDay, deleteTrip } from '../controllers/tripController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Apply requireAuth middleware to all trip routes
router.use(requireAuth);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id/day/:dayId', updateTripDay);
router.delete('/:id', deleteTrip);

export default router;
