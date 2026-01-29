'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, MapPin, Sparkles, Loader2 } from 'lucide-react';

const birthDetailsSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
});

type BirthDetailsFormData = z.infer<typeof birthDetailsSchema>;

interface BirthDetailsFormProps {
  onSubmitSuccess?: (data: any) => void;
}

export function BirthDetailsForm({ onSubmitSuccess }: BirthDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<BirthDetailsFormData>({
    resolver: zodResolver(birthDetailsSchema)
  });

  const searchLocation = async (place: string) => {
    if (!place || place.length < 3) return;

    setSearchingLocation(true);
    try {
      // You can integrate with a geocoding API here
      // For now, this is a placeholder
      console.log('Searching for:', place);
      // const response = await fetch(`geocoding-api-url?q=${place}`);
      // const data = await response.json();
      // setValue('latitude', data.lat);
      // setValue('longitude', data.lon);
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setSearchingLocation(false);
    }
  };

  const onSubmit = async (data: BirthDetailsFormData) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/astrology/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        onSubmitSuccess?.(result.data);
      } else {
        alert(result.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save birth details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Your Birth Details</h2>
        </div>
        <p className="text-gray-600">
          Help us create your personalized Vedic astrology profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-purple-600" />
            Date of Birth *
          </label>
          <input
            type="date"
            {...register('dateOfBirth')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Time of Birth */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 text-purple-600" />
            Time of Birth (Optional, but recommended)
          </label>
          <input
            type="time"
            {...register('timeOfBirth')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500">
            Exact birth time helps generate accurate Lagna (Ascendant) and Dasha periods
          </p>
        </div>

        {/* Place of Birth */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-purple-600" />
            Place of Birth *
          </label>
          <input
            type="text"
            {...register('placeOfBirth')}
            onChange={(e) => searchLocation(e.target.value)}
            placeholder="e.g., Mumbai, India"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          />
          {searchingLocation && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Searching location...
            </p>
          )}
          {errors.placeOfBirth && (
            <p className="text-sm text-red-600">{errors.placeOfBirth.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Why we need this information:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Calculate your Sun sign, Moon sign, and Ascendant (Lagna)</li>
            <li>• Determine your Nakshatra (birth star)</li>
            <li>• Generate accurate Kundli (birth chart)</li>
            <li>• Identify current Mahadasha and Antardasha periods</li>
            <li>• Provide personalized gemstone recommendations</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating your profile...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create My Astrology Profile
            </>
          )}
        </button>
      </form>

      {/* Privacy Note */}
      <p className="text-xs text-center text-gray-500 mt-6">
        Your data is encrypted and secure. We use it only for astrology calculations and never share with third parties.
      </p>
    </div>
  );
}
