import { Response } from 'express';
import Trip from '../models/Trip';
import { AuthenticatedRequest } from '../types';
import { generateTripPlan, regenerateDayItinerary } from '../services/openaiService';

export const createTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { destination, duration, budgetLevel, interests } = req.body;

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ error: 'A valid destination is required' });
    }
    
    destination = destination.trim();
    if (destination.length > 80) {
      return res.status(400).json({ error: 'Destination is too long. Please enter a concise city or country name.' });
    }

    if (!duration || !budgetLevel || !interests) {
      return res.status(400).json({ error: 'destination, duration, budgetLevel, and interests are required' });
    }

    if (duration <= 0 || duration > 14) {
      return res.status(400).json({ error: 'Duration must be between 1 and 14 days to ensure optimal AI itinerary generation' });
    }

    if (!['Low', 'Medium', 'High'].includes(budgetLevel)) {
      return res.status(400).json({ error: 'budgetLevel must be Low, Medium, or High' });
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'interests must be a non-empty array of strings' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Generate trip details via OpenAI or mock generator
    const generatedPlan = await generateTripPlan(
      destination,
      duration,
      budgetLevel,
      interests
    );

    const trip = new Trip({
      userId: req.user.id,
      destination,
      duration,
      budgetLevel,
      interests,
      itinerary: generatedPlan.itinerary,
      estimatedBudget: generatedPlan.estimatedBudget,
      recommendedHotels: generatedPlan.recommendedHotels,
      packingList: generatedPlan.packingList,
      weatherForecast: generatedPlan.weatherForecast
    });

    await trip.save();

    return res.status(201).json({ trip });
  } catch (error: any) {
    console.error('Create trip error:', error);
    // Handle AI validation errors gracefully
    if (error.message && !error.message.includes('Failed to fetch')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Database validation failed for the trip data.' });
    }
    return res.status(500).json({ error: 'Failed to generate and create travel plan' });
  }
};

export const getTrips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict Data Isolation Check: filter by req.user.id
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ trips });
  } catch (error: any) {
    console.error('Get trips error:', error);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const getTripById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict Data Isolation Check: filter by both _id and userId
    const trip = await Trip.findOne({ _id: id, userId: req.user.id });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    return res.json({ trip });
  } catch (error: any) {
    console.error('Get trip by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch trip details' });
  }
};

export const updateTripDay = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, dayId } = req.params; // dayId maps to dayNumber
    const dayNumber = parseInt(dayId, 10);

    if (isNaN(dayNumber)) {
      return res.status(400).json({ error: 'dayId must be a valid number' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict Data Isolation Check
    const trip = await Trip.findOne({ _id: id, userId: req.user.id });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Verify day exists
    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === dayNumber);
    if (dayIndex === -1) {
      return res.status(404).json({ error: `Day ${dayNumber} does not exist in this trip` });
    }

    let { tweakRequest, activities } = req.body;

    if (tweakRequest) {
      tweakRequest = tweakRequest.trim();
      if (tweakRequest.length > 300) {
        return res.status(400).json({ error: 'Tweak request must be under 300 characters.' });
      }

      // AI regeneration of the specific day
      const regeneratedDay = await regenerateDayItinerary(
        dayNumber,
        trip.itinerary,
        tweakRequest
      );
      
      trip.itinerary[dayIndex].activities = regeneratedDay.activities;
    } else if (activities && Array.isArray(activities)) {
      // Manual edit of the specific day
      // Validate activities format
      for (const act of activities) {
        if (!act.time || !act.description || !act.type) {
          return res.status(400).json({ error: 'Each activity must contain time, description, and type' });
        }
      }
      trip.itinerary[dayIndex].activities = activities;
    } else {
      return res.status(400).json({ error: 'Either tweakRequest (for AI) or activities (for manual edit) must be provided' });
    }

    // Mark itinerary path modified and save
    trip.markModified('itinerary');
    await trip.save();

    return res.json({ 
      message: `Day ${dayNumber} updated successfully`, 
      trip 
    });
  } catch (error: any) {
    console.error('Update trip day error:', error);
    return res.status(500).json({ error: 'Failed to update itinerary day' });
  }
};

export const deleteTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict Data Isolation Check
    const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedTrip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    return res.json({ message: 'Trip deleted successfully', id });
  } catch (error: any) {
    console.error('Delete trip error:', error);
    return res.status(500).json({ error: 'Failed to delete trip' });
  }
};
