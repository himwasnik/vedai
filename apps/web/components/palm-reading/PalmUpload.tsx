'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Hand, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface PalmUploadProps {
  onUploadComplete?: (result: any) => void;
}

export function PalmUpload({ onUploadComplete }: PalmUploadProps) {
  const [selectedHand, setSelectedHand] = useState<'left' | 'right'>('right');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        uploadPalmImage(file);
      }
    }
  });

  const uploadPalmImage = async (file: File) => {
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('handType', selectedHand);

      const token = localStorage.getItem('token'); // Get JWT token

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/astrology/palm-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onUploadComplete?.(data.data);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Palm Reading</h2>
        <p className="text-gray-600">
          Upload a clear image of your palm for AI-powered Vedic palmistry analysis
        </p>
      </div>

      {/* Hand Selection */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedHand('left')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
            selectedHand === 'left'
              ? 'border-purple-600 bg-purple-50 text-purple-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Hand className="w-5 h-5" />
          <span className="font-medium">Left Hand</span>
        </button>
        <button
          onClick={() => setSelectedHand('right')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
            selectedHand === 'right'
              ? 'border-purple-600 bg-purple-50 text-purple-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Hand className="w-5 h-5 scale-x-[-1]" />
          <span className="font-medium">Right Hand</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-64 h-64 mx-auto">
              <Image
                src={preview}
                alt="Palm preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            {!uploading && !result && (
              <p className="text-sm text-gray-600">Click or drag to change image</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 mx-auto text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your palm image here' : 'Upload palm image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Analyzing your palm...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Analysis complete!</span>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Your Palm Reading
            </h3>
            <div className="prose prose-purple max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {result.analysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure good lighting for clear visibility of palm lines</li>
          <li>• Keep your palm flat and fingers slightly spread</li>
          <li>• Take photo from directly above your palm</li>
          <li>• Remove any accessories or jewelry from your hand</li>
        </ul>
      </div>
    </div>
  );
}
