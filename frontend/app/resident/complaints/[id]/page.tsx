'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import apiService from '../../../../src/lib/api'
import { Complaint } from '../../../../src/types'
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ComplaintDetails() {
  const params = useParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComplaint()
  }, [])

  const fetchComplaint = async () => {
    try {
      const data = await apiService.getComplaint(Number(params.id))
      setComplaint(data)
    } catch (err: any) {
      setError('Failed to load complaint')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-500" />
      case 'RESOLVED': return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error || 'Complaint not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Complaint #{complaint.id}
            </h1>
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold">{complaint.category}</h2>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.status}
                </span>
                {complaint.is_overdue && (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Priority: <span className={`font-medium ${
                  complaint.priority === 'HIGH' ? 'text-red-600' :
                  complaint.priority === 'MEDIUM' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>{complaint.priority}</span>
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
            {complaint.history.map((entry, index) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <div className="shrink-0 mt-1">
                  {getStatusIcon(entry.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entry.status}</span>
                    <span className="text-sm text-gray-500">
                      by {entry.actor_name}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}