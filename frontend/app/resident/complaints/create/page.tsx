'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import apiService from '../../../../src/lib/api'
import { ComplaintCategory } from '../../../../src/types'
import { ArrowLeft, Upload, X, Image, Bell } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function CreateComplaint() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [category, setCategory] = useState<ComplaintCategory>('PLUMBING')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const categories: { value: ComplaintCategory; label: string }[] = [
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OTHER', label: 'Other' },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Max 5MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('File type not allowed. Please upload an image (JPEG, PNG, WEBP, GIF)')
        return
      }
      
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  const removePhoto = () => {
    setPhoto(null)
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setUploading(true)

    try {
      let photo_url = null

      // Upload photo if selected
      if (photo) {
        try {
          const uploadResult = await apiService.uploadPhoto(photo)
          photo_url = uploadResult.url
        } catch (err: any) {
          setError('Failed to upload photo: ' + (err.response?.data?.detail || err.message))
          setUploading(false)
          setLoading(false)
          return
        }
      }

      setUploading(false)

      // Create complaint with photo URL
      await apiService.createComplaint({
        category,
        description,
        photo_url: photo_url || undefined,
      })
      
      router.push('/resident/complaints')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create complaint')
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Raise Complaint</h1>
            <div className="flex items-center space-x-6">
              <Link
                href="/resident/notices"
                className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center"
              >
                <Bell className="h-4 w-4 mr-1" />
                Notice Board
              </Link>
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/resident/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your issue in detail..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              
              {!photoPreview ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, WEBP, GIF (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="rounded-lg max-h-64 object-cover border"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Link
                href="/resident/dashboard"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {uploading ? 'Uploading Photo...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}