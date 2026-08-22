'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../../src/lib/api'
import { Complaint } from '../../../src/types'
import { ArrowLeft, Bell, Filter } from 'lucide-react'

export default function ResidentComplaints() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterStatus) params.status = filterStatus
      const data = await apiService.getComplaints(params)
      setComplaints(data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/resident/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <Link
            href="/resident/complaints/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Complaint
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No complaints found. Raise your first complaint!
            </p>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/resident/complaints/${complaint.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          #{complaint.id} - {complaint.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        {complaint.is_overdue && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {complaint.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(complaint.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}