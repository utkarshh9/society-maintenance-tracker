'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../../src/lib/api'
import { Complaint, Notice } from '../../../src/types'
import { Plus, Clock, CheckCircle, AlertCircle, Bell, Home } from 'lucide-react'

export default function ResidentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [complaintsRes, noticesRes] = await Promise.all([
        apiService.getComplaints(),
        apiService.getNotices(),
      ])
      setComplaints(complaintsRes)
      setNotices(noticesRes)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  }

  const importantNotices = notices.filter(n => n.is_important)

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
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
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
        {/* Important Notices */}
        {importantNotices.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              <Bell className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <p className="font-medium text-yellow-800">Important Notices</p>
                {importantNotices.map(notice => (
                  <p key={notice.id} className="text-yellow-700 text-sm mt-1">
                    📢 {notice.title} - {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/resident/complaints/create"
            className="bg-white rounded-xl shadow-md p-8 hover:bg-blue-50 border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-lg font-medium text-blue-600">Raise New Complaint</span>
          </Link>
          <Link
            href="/resident/complaints"
            className="bg-white rounded-xl shadow-md p-8 hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <Clock className="h-8 w-8 text-gray-600 mr-2" />
            <span className="text-lg font-medium text-gray-600">View All Complaints</span>
          </Link>
          <Link
            href="/resident/notices"
            className="bg-white rounded-xl shadow-md p-8 hover:bg-yellow-50 border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors"
          >
            <Bell className="h-8 w-8 text-yellow-600 mr-2" />
            <span className="text-lg font-medium text-yellow-600">Notice Board</span>
          </Link>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No complaints yet. Raise your first complaint!
            </p>
          ) : (
            <div className="space-y-4">
              {complaints.slice(0, 5).map(complaint => (
                <Link
                  key={complaint.id}
                  href={`/resident/complaints/${complaint.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{complaint.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {complaint.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.status}
                      </span>
                      {complaint.is_overdue && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}