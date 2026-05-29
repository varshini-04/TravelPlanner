import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;
let isInitialized = false;

function getOpenAI(): OpenAI | null {
  if (!isInitialized) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_API_BASE_URL || undefined;
    const hasValidKey = apiKey && apiKey !== 'mock-key' && apiKey.trim() !== '';

    openaiInstance = hasValidKey 
      ? new OpenAI({ apiKey, baseURL })
      : null;
    isInitialized = true;
  }
  return openaiInstance;
}
export interface GeneratedTripPlan {
  itinerary: {
    dayNumber: number;
    activities: {
      time: string;
      description: string;
      type: string;
    }[];
  }[];
  estimatedBudget: {
    currency: string;
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    total: number;
  };
  recommendedHotels: {
    name: string;
    tier: string;
    description: string;
  }[];
  packingList: string[];
  weatherForecast: {
    temperature: string;
    condition: string;
    description: string;
  };
}

export interface GeneratedDay {
  dayNumber: number;
  activities: {
    time: string;
    description: string;
    type: string;
  }[];
}

// Mock Trip generator for development when API key is not configured
const generateMockTrip = (
  destination: string,
  duration: number,
  budgetLevel: string,
  interests: string[]
): GeneratedTripPlan => {
  const interestList = interests.join(', ');
  const defaultActivities = [
    { time: '09:00 AM', description: `Explore popular landmark in ${destination} matching ${interestList}`, type: 'sightseeing' },
    { time: '01:00 PM', description: `Enjoy a traditional local lunch at a highly-rated spot`, type: 'food' },
    { time: '03:30 PM', description: `Afternoon activity: immersive local experience tailored to interests`, type: 'adventure' },
    { time: '07:30 PM', description: `Dinner and a relaxed evening walk around ${destination}`, type: 'relaxation' }
  ];

  const itinerary = Array.from({ length: duration }, (_, i) => ({
    dayNumber: i + 1,
    activities: defaultActivities.map(act => ({ ...act }))
  }));

  // Budget levels
  const multipliers = { Low: 0.5, Medium: 1, High: 2 };
  const mult = multipliers[budgetLevel as 'Low' | 'Medium' | 'High'] || 1;

  const flights = Math.round(400 * mult);
  const accommodation = Math.round(80 * duration * mult);
  const food = Math.round(40 * duration * mult);
  const activities = Math.round(30 * duration * mult);
  const total = flights + accommodation + food + activities;

  return {
    itinerary,
    estimatedBudget: { currency: '$', flights, accommodation, food, activities, total },
    recommendedHotels: [
      { name: `Grand ${destination} Plaza`, tier: budgetLevel === 'Low' ? 'Budget' : budgetLevel === 'Medium' ? 'Mid-Range' : 'Luxury', description: `A highly rated accommodation option in ${destination} perfect for your stay.` },
      { name: `${destination} Cozy Inn`, tier: 'Budget', description: 'Affordable, clean, and centrally located.' }
    ],
    packingList: [
      'Comfortable walking shoes',
      'Universal power adapter',
      'Weather-appropriate clothing',
      'Reusable water bottle',
      `Gear related to ${interests[0] || 'sightseeing'}`
    ],
    weatherForecast: {
      temperature: '18°C - 25°C',
      condition: 'Sunny with partial cloud cover',
      description: 'Pleasant temperature, ideal for walking tours and outdoor sightseeing.'
    }
  };
};

export const generateTripPlan = async (
  destination: string,
  duration: number,
  budgetLevel: 'Low' | 'Medium' | 'High',
  interests: string[]
): Promise<GeneratedTripPlan> => {
  const openai = getOpenAI();
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!openai) {
    console.log('OpenAI API Key is mock or missing. Returning simulated mock trip.');
    return generateMockTrip(destination, duration, budgetLevel, interests);
  }

  const systemPrompt = `You are an expert travel agent. You must output your response strictly as a JSON object adhering to the following schema:
{
  "error": "string (OPTIONAL. If the destination is not a real geographical location, is gibberish, or is too vague, provide a descriptive error message here. Leave this field out completely if the destination is valid.)",
  "itinerary": [
    {
      "dayNumber": number,
      "activities": [
        {
          "time": "string (e.g. 09:00 AM)",
          "description": "string",
          "type": "string (e.g. sightseeing, food, adventure, relaxation, transit)"
        }
      ]
    }
  ],
  "estimatedBudget": {
    "currency": "string (The symbol of the local currency, e.g. $, ₹, €, £, ¥)",
    "flights": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "total": number
  },
  "recommendedHotels": [
    {
      "name": "string",
      "tier": "string (e.g. Budget, Mid-Range, Luxury)",
      "description": "string"
    }
  ],
  "packingList": ["string"],
  "weatherForecast": {
    "temperature": "string (e.g. 15°C - 22°C)",
    "condition": "string (e.g. Sunny, Rainy)",
    "description": "string"
  }
}

CRITICAL VALIDATION INSTRUCTIONS:
- You MUST verify that the destination is a real, known geographical location on Earth suitable for travel. 
- If the destination is fake, gibberish (e.g., 'anibn', 'asdf'), a fictional place (e.g., 'Hogwarts', 'Narnia'), or too vague, you MUST return ONLY the "error" field with a polite message (e.g. "We could not find a valid travel destination for '...'. Please enter a real city or country."). Do not generate an itinerary.
- If the duration is more than 10 days, you MUST keep activity descriptions extremely concise (1 short sentence max) to ensure the full itinerary fits within your output limits.

The packing list must be smart and highly customized, listing physical items needed based on the activities in the itinerary and the destination.
The weather forecast should represent a realistic weather simulation for the destination during typical travel seasons.

CRITICAL BUDGET INSTRUCTIONS:
- Determine the local currency of the destination and output its symbol in the 'currency' field (e.g. '₹' for India, '€' for Europe, '$' for US).
- Generate all costs using this exact local currency (do NOT use USD unless it's the local currency).
- Ensure the estimatedBudget numbers are highly realistic for the destination and budget level (Low, Medium, High) in that local currency. 
- The 'total' must be exactly the sum of flights, accommodation, food, and activities.
- Provide all costs as integers.`;

  const userPrompt = `Generate a travel plan for:
Destination: ${destination}
Duration: ${duration} days
Budget Level: ${budgetLevel}
Interests: ${interests.join(', ')}`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    let content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    // Strip markdown formatting if present (e.g., ```json\n...\n```)
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

    const parsed = JSON.parse(content);
    
    if (parsed.error) {
      throw new Error(`VALIDATION_ERROR: ${parsed.error}`);
    }

    return parsed as GeneratedTripPlan;
  } catch (error: any) {
    if (error.message && error.message.startsWith('VALIDATION_ERROR:')) {
      throw new Error(error.message.replace('VALIDATION_ERROR: ', ''));
    }
    console.error('Error generating trip plan with OpenAI:', error);
    // Fallback to mock trip if API fails
    return generateMockTrip(destination, duration, budgetLevel, interests);
  }
};

export const regenerateDayItinerary = async (
  dayNumber: number,
  existingItinerary: any[],
  tweakRequest: string
): Promise<GeneratedDay> => {
  const openai = getOpenAI();
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!openai) {
    console.log('OpenAI API Key is mock or missing. Returning simulated modified day.');
    return {
      dayNumber,
      activities: [
        { time: '09:00 AM', description: `Modified Activity: ${tweakRequest}`, type: 'adventure' },
        { time: '01:00 PM', description: 'Enjoy lunch featuring regional specialties', type: 'food' },
        { time: '03:00 PM', description: 'Exploration following your customization guidelines', type: 'sightseeing' },
        { time: '07:00 PM', description: 'Relaxing dinner to conclude the modified day', type: 'relaxation' }
      ]
    };
  }

  const systemPrompt = `You are an expert travel agent. The user wants to modify a specific day of an existing trip itinerary.
You must output your response strictly as a JSON object matching the following structure:
{
  "dayNumber": number,
  "activities": [
    {
      "time": "string (e.g. 09:00 AM)",
      "description": "string",
      "type": "string"
    }
  ]
}
Do not include any other fields in the output JSON. Return only the dayNumber and its activities array. Make sure activities align with the user's specific request.`;

  const userPrompt = `Existing Itinerary: ${JSON.stringify(existingItinerary, null, 2)}
Day to modify: ${dayNumber}
User tweak request: ${tweakRequest}`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    let content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    // Strip markdown formatting if present
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

    return JSON.parse(content) as GeneratedDay;
  } catch (error) {
    console.error('Error regenerating day with OpenAI:', error);
    return {
      dayNumber,
      activities: [
        { time: '09:00 AM', description: `Fallback Activity: ${tweakRequest}`, type: 'adventure' },
        { time: '01:00 PM', description: 'Standard Lunch', type: 'food' },
        { time: '03:00 PM', description: 'Sightseeing trip', type: 'sightseeing' }
      ]
    };
  }
};
