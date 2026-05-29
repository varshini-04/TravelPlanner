import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity {
  time: string;
  description: string;
  type: string;
}

export interface IDayItinerary {
  dayNumber: number;
  activities: IActivity[];
}

export interface IEstimatedBudget {
  currency: string;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IRecommendedHotel {
  name: string;
  tier: string;
  description: string;
}

export interface IWeatherSimulator {
  temperature: string;
  condition: string;
  description: string;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  duration: number;
  budgetLevel: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: IDayItinerary[];
  estimatedBudget: IEstimatedBudget;
  recommendedHotels: IRecommendedHotel[];
  packingList: string[];
  weatherForecast?: IWeatherSimulator;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  time: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true }
}, { _id: false });

const DayItinerarySchema = new Schema<IDayItinerary>({
  dayNumber: { type: Number, required: true },
  activities: { type: [ActivitySchema], required: true }
}, { _id: false });

const EstimatedBudgetSchema = new Schema<IEstimatedBudget>({
  currency: { type: String, required: true, default: '$' },
  flights: { type: Number, required: true },
  accommodation: { type: Number, required: true },
  food: { type: Number, required: true },
  activities: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const RecommendedHotelSchema = new Schema<IRecommendedHotel>({
  name: { type: String, required: true },
  tier: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const WeatherSimulatorSchema = new Schema<IWeatherSimulator>({
  temperature: { type: String, required: true },
  condition: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const TripSchema = new Schema<ITrip>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  budgetLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    required: true 
  },
  interests: { type: [String], required: true },
  itinerary: { type: [DayItinerarySchema], required: true },
  estimatedBudget: { type: EstimatedBudgetSchema, required: true },
  recommendedHotels: { type: [RecommendedHotelSchema], required: true },
  packingList: { type: [String], default: [] },
  weatherForecast: { type: WeatherSimulatorSchema },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITrip>('Trip', TripSchema);
