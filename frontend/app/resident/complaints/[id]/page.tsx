'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import apiService from '../../../../src/lib/api'
import { Complaint } from '../../../../src/types'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, AlertTriangle, Bell } from 'lucide-react'

export default function ComplaintDetails() {
  const params = useParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true)
        setError(null)

        const complaintId = Number(params.id)
        if (isNaN(complaintId) || complaintId <= 0) {
          setError('Invalid complaint ID')
          setLoading(false)
          return
        }

        const data = await apiService.getComplaint(complaintId)
        setComplaint(data)
      } catch (err: any) {
        console.error('Error fetching complaint:', err)

        if (err.response?.status === 404) {
          setError('Complaint not found')
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this complaint')
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.')
        } else if (err.message === 'Network Error') {
          setError('Network error. Please check your connection.')
        } else {
          setError('Failed to load complaint. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [params.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !complaint) {
    const isNotFound = error === 'Complaint not found'
    const isPermission = error === 'You do not have permission to view this complaint'

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isNotFound ? 'Complaint Not Found' : 'Error'}
              </h1>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isNotFound ? 'bg-yellow-50' : 'bg-red-50'}`}>
                {isNotFound ? (
                  <AlertTriangle className="h-12 w-12 text-yellow-500" />
                ) : isPermission ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isNotFound ? 'Complaint Not Found' : isPermission ? 'Access Denied' : 'Something Went Wrong'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <Link
                href="/resident/complaints"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Complaints
              </Link>
              <Link
                href="/resident/dashboard"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ COMPLAINT FOUND - Render the details
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Complaint #{complaint.id}</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/resident/complaints"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Complaints
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <h2 className="text-xl font-semibold">{complaint.category}</h2>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    complaint.status === 'OPEN'
                      ? 'bg-yellow-100 text-yellow-800'
                      : complaint.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {complaint.status}
                </span>
                {complaint.is_overdue && (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Priority:{' '}
                <span
                  className={`font-medium ${
                    complaint.priority === 'HIGH'
                      ? 'text-red-600'
                      : complaint.priority === 'MEDIUM'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {complaint.priority}
                </span>
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Created: {new Date(complaint.created_at).toLocaleString()}</p>
              {complaint.resolved_at && (
                <p>Resolved: {new Date(complaint.resolved_at).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{complaint.description}</p>
          </div>

          {complaint.photo_url && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Photo</h3>
              <img
                src={complaint.photo_url}
                alt="Complaint"
                className="rounded-lg max-h-64 object-cover"
              />
            </div>
          )}
        </div>

        {/* History Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Status History</h3>
          <div className="space-y-4">
            {complaint.history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No history available</p>
            ) : (
              complaint.history.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3">
                  <div className="shrink-0 mt-1">{getStatusIcon(entry.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="font-medium">{entry.status}</span>
                      <span className="text-sm text-gray-500">by {entry.actor_name}</span>
                    </div>
                    {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}