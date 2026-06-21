import React, { useState } from 'react';

interface FormData {
  personal: {
    height: string;
    weight: string;
    gender: string;
    diet: string;
    socialActivity: string;
  };
  travel: {
    transportation: string;
    monthlyDistance: number;
    flightsLastMonth: string;
  };
  waste: {
    basePackSize: string;
    wasteBagsPerWeek: number;
    recyclingMaterial: string;
  };
  energy: {
    heatingSource: string;
    cookingSystem: string;
    tvHours: number;
    internetHours: number;
  };
  consumption: {
    shopping: number;
    services: number;
  };
}

const CarbonFootprintCalculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    personal: { height: '170-180', weight: '65-80', gender: 'prefer_not', diet: 'omnivore', socialActivity: 'sometimes' },
    travel: { transportation: 'public', monthlyDistance: 0, flightsLastMonth: 'never' },
    waste: { basePackSize: 'medium', wasteBagsPerWeek: 0, recyclingMaterial: 'none' },
    energy: { heatingSource: 'naturalGas', cookingSystem: 'stove', tvHours: 0, internetHours: 0 },
    consumption: { shopping: 0, services: 0 },
  });

  const [totalFootprint, setTotalFootprint] = useState<number | null>(null);

  const handleChange = (category: keyof FormData, field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [parent]: {
            ...((prev[category] as any)[parent] || {}),
            [child]: value,
          },
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const calculateFootprint = () => {
    // Dummy calculation: In a real app, you'd use more sophisticated formulas
    // These are arbitrary multipliers for demonstration purposes
    const dietMap: Record<string, number> = { omnivore: 1.5, vegetarian: 0.9, vegan: 0.7 };
    const socialMap: Record<string, number> = { never: 0.8, sometimes: 1.0, often: 1.2 };
    const weightMap: Record<string, number> = { '<50': 0.9, '50-65': 1.0, '65-80': 1.1, '80-95': 1.2, '95+': 1.3 };
    const heightMap: Record<string, number> = { 'Under 150': 0.95, '150-160': 0.98, '160-170': 1.0, '170-180': 1.02, '180-190': 1.03, '190+': 1.05 };
    const genderMap: Record<string, number> = { male: 1.02, female: 0.98, other: 1.0, prefer_not: 1.0 };

    const dietFactor = dietMap[formData.personal.diet] ?? 1.0;
    const socialFactor = socialMap[formData.personal.socialActivity] ?? 1.0;
    const weightFactor = weightMap[formData.personal.weight] ?? 1.0;
    const heightFactor = heightMap[formData.personal.height] ?? 1.0;
    const genderFactor = genderMap[formData.personal.gender] ?? 1.0;

    const personalFootprint = 30 * dietFactor * socialFactor * weightFactor * heightFactor * genderFactor;

    const transportFactorMap: Record<string, number> = { public: 0.5, private: 1.2, walk: 0.0, bicycle: 0.0 };
    const transportFactor = transportFactorMap[formData.travel.transportation] ?? 1.0;
    const monthlyDistance = Number(formData.travel.monthlyDistance) || 0;
    const flightsMap: Record<string, number> = { never: 0, once: 200, multiple: 500 };

    const travelFootprint = (monthlyDistance * 0.2 * transportFactor) + (flightsMap[formData.travel.flightsLastMonth] ?? 0);

    const basePackMap: Record<string, number> = { small: 0.8, medium: 1.0, large: 1.2 };
    const basePackFactor = basePackMap[formData.waste.basePackSize] ?? 1.0;
    const wasteBagsFactor = Number(formData.waste.wasteBagsPerWeek) * 2.0; // arbitrary multiplier per bag/week
    const recyclingReductionMap: Record<string, number> = { none: 0, plastic: 5, paper: 2, metal: 3, glass: 4 };
    const recyclingReduction = recyclingReductionMap[formData.waste.recyclingMaterial] ?? 0;
    const wasteFootprint = (10 * basePackFactor) + wasteBagsFactor - recyclingReduction;

    const heatingMap: Record<string, number> = { naturalGas: 1.2, electricity: 1.0, wood: 1.5, coal: 2.0 };
    const cookingMap: Record<string, number> = { microwave: 0.8, oven: 1.2, grill: 1.3, 'air fryer': 0.9, stove: 1.0 };
    const heatingFactor = heatingMap[formData.energy.heatingSource] ?? 1.0;
    const cookingFactor = cookingMap[formData.energy.cookingSystem] ?? 1.0;
    const energyFootprint = (100 * heatingFactor) + (20 * cookingFactor) + (Number(formData.energy.tvHours) * 0.2) + (Number(formData.energy.internetHours) * 0.1);
    const consumptionFootprint = (formData.consumption.shopping * 1.2) + (formData.consumption.services * 0.7);

    const total = personalFootprint + travelFootprint + wasteFootprint + energyFootprint + consumptionFootprint;
    setTotalFootprint(total);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 mt-10">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Calculate Your Carbon Footprint</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Personal */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Habits</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-600">Height</label>
              <select
                id="height"
                value={formData.personal.height}
                onChange={(e) => handleChange('personal', 'height', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Under 150">Under 150</option>
                <option value="150-160">150-160</option>
                <option value="160-170">160-170</option>
                <option value="170-180">170-180</option>
                <option value="180-190">180-190</option>
                <option value="190+">190+</option>
              </select>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-600">Weight</label>
              <select
                id="weight"
                value={formData.personal.weight}
                onChange={(e) => handleChange('personal', 'weight', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="<50">Under 50 kg</option>
                <option value="50-65">50-65 kg</option>
                <option value="65-80">65-80 kg</option>
                <option value="80-95">80-95 kg</option>
                <option value="95+">95+ kg</option>
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-600">Gender</label>
              <select
                id="gender"
                value={formData.personal.gender}
                onChange={(e) => handleChange('personal', 'gender', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="diet" className="block text-sm font-medium text-gray-600">Diet</label>
              <select
                id="diet"
                value={formData.personal.diet}
                onChange={(e) => handleChange('personal', 'diet', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="omnivore">Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label htmlFor="socialActivity" className="block text-sm font-medium text-gray-600">Social Activity</label>
              <select
                id="socialActivity"
                value={formData.personal.socialActivity}
                onChange={(e) => handleChange('personal', 'socialActivity', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="never">Never</option>
                <option value="sometimes">Sometimes</option>
                <option value="often">Often</option>
              </select>
            </div>
          </div>
        </div>

        {/* Travel */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Travel</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="transportation" className="block text-sm font-medium text-gray-600">Transportation</label>
              <select
                id="transportation"
                value={formData.travel.transportation}
                onChange={(e) => handleChange('travel', 'transportation', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="walk">Walk</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label htmlFor="monthlyDistance" className="block text-sm font-medium text-gray-600">Monthly distance traveled by vehicle (km): {formData.travel.monthlyDistance}</label>
              <input
                type="range"
                id="monthlyDistance"
                min={0}
                max={5000}
                step={10}
                value={formData.travel.monthlyDistance}
                onChange={(e) => handleChange('travel', 'monthlyDistance', Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label htmlFor="flightsLastMonth" className="block text-sm font-medium text-gray-600">How often did you fly last month?</label>
              <select
                id="flightsLastMonth"
                value={formData.travel.flightsLastMonth}
                onChange={(e) => handleChange('travel', 'flightsLastMonth', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="never">Never</option>
                <option value="once">Once</option>
                <option value="multiple">Multiple times</option>
              </select>
            </div>
          </div>
        </div>

        {/* Waste */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Waste Management</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="basePackSize" className="block text-sm font-medium text-gray-600">What is the size of your waste bag?</label>
              <select
                id="basePackSize"
                value={formData.waste.basePackSize}
                onChange={(e) => handleChange('waste', 'basePackSize', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label htmlFor="wasteBagsPerWeek" className="block text-sm font-medium text-gray-600">How many waste bags do you trash out in a week? {formData.waste.wasteBagsPerWeek}</label>
              <input
                type="range"
                id="wasteBagsPerWeek"
                min={0}
                max={10}
                step={1}
                value={formData.waste.wasteBagsPerWeek}
                onChange={(e) => handleChange('waste', 'wasteBagsPerWeek', Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label htmlFor="recyclingMaterial" className="block text-sm font-medium text-gray-600">Do you recycle any materials below?</label>
              <select
                id="recyclingMaterial"
                value={formData.waste.recyclingMaterial}
                onChange={(e) => handleChange('waste', 'recyclingMaterial', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="none">None</option>
                <option value="plastic">Plastic</option>
                <option value="paper">Paper</option>
                <option value="metal">Metal</option>
                <option value="glass">Glass</option>
              </select>
            </div>
          </div>
        </div>

        {/* Energy */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Energy Consumption</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="heatingSource" className="block text-sm font-medium text-gray-600">What power source do you use for heating?</label>
              <select
                id="heatingSource"
                value={formData.energy.heatingSource}
                onChange={(e) => handleChange('energy', 'heatingSource', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="naturalGas">Natural Gas</option>
                <option value="electricity">Electricity</option>
                <option value="wood">Wood</option>
                <option value="coal">Coal</option>
              </select>
            </div>

            <div>
              <label htmlFor="cookingSystem" className="block text-sm font-medium text-gray-600">What cooking system do you use?</label>
              <select
                id="cookingSystem"
                value={formData.energy.cookingSystem}
                onChange={(e) => handleChange('energy', 'cookingSystem', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="microwave">Microwave</option>
                <option value="oven">Oven</option>
                <option value="grill">Grill</option>
                <option value="air fryer">Air Fryer</option>
                <option value="stove">Stove</option>
              </select>
            </div>

            <div>
              <label htmlFor="tvHours" className="block text-sm font-medium text-gray-600">How many hours a day do you spend in front of your TV? {formData.energy.tvHours}</label>
              <input
                type="range"
                id="tvHours"
                min={0}
                max={24}
                step={1}
                value={formData.energy.tvHours}
                onChange={(e) => handleChange('energy', 'tvHours', Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label htmlFor="internetHours" className="block text-sm font-medium text-gray-600">What is your daily Internet usage in hrs? {formData.energy.internetHours}</label>
              <input
                type="range"
                id="internetHours"
                min={0}
                max={24}
                step={1}
                value={formData.energy.internetHours}
                onChange={(e) => handleChange('energy', 'internetHours', Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>
          </div>
        </div>

        {/* Consumption */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Consumption Habits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shopping" className="block text-sm font-medium text-gray-600">Shopping (USD/month)</label>
              <input
                type="number"
                id="shopping"
                value={formData.consumption.shopping}
                onChange={(e) => handleChange("consumption", "shopping", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., clothes, electronics"
              />
            </div>
            <div>
              <label htmlFor="services" className="block text-sm font-medium text-gray-600">Services (USD/month)</label>
              <input
                type="number"
                id="services"
                value={formData.consumption.services}
                onChange={(e) => handleChange("consumption", "services", Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., streaming, dining out"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={calculateFootprint}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out font-semibold text-lg"
      >
        Calculate Footprint
      </button>

      {totalFootprint !== null && (
        <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-md shadow-md">
          <h3 className="text-2xl font-bold mb-2">Your Estimated Carbon Footprint:</h3>
          <p className="text-4xl font-extrabold text-blue-900">{totalFootprint.toFixed(2)} kg CO2e</p>
          <p className="mt-4 text-sm">This is an estimation. For precise calculations, consult with environmental experts.</p>
        </div>
      )}
    </div>
  );
};

export default CarbonFootprintCalculator;
