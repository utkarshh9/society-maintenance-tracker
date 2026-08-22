'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../../src/lib/api'
import { Complaint, DashboardStats } from '../../../src/types'
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [overdueComplaints, setOverdueComplaints] = useState<Complaint[]>([])
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, overdueData, complaintsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getOverdueComplaints(),
        apiService.getComplaints({ status: 'OPEN' }),
      ])
      setStats(statsData)
      setOverdueComplaints(overdueData)
      setRecentComplaints(complaintsData.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 shrink-0 px-4 border-b">
            <LayoutDashboard className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="/admin/dashboard"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <LayoutDashboard className="mr-3 h-5 w-5 text-blue-500" />
              Dashboard
            </Link>
            <Link
              href="/admin/complaints"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Complaints
            </Link>
            <Link
              href="/admin/notices"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Bell className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Notices
            </Link>
          </nav>
          <div className="shrink-0 flex border-t p-4">
            <div className="shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="ml-auto text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="md:hidden text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.by_status?.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.by_status?.resolved || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts - Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Complaints by Status</h3>
              <div className="space-y-3">
                {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'open' ? 'bg-yellow-500' :
                          status === 'in_progress' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{
                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Complaints by Category</h3>
              <div className="space-y-3">
                {stats?.by_category && Object.entries(stats.by_category).map(([category, count]) => (
                  count > 0 && (
                    <div key={category}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Complaints */}
          {overdueComplaints.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-600">Overdue Complaints</h3>
                <span className="ml-auto text-sm text-red-600">{overdueComplaints.length} overdue</span>
              </div>
              <div className="space-y-3">
                {overdueComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    href={`/admin/complaints/${complaint.id}`}
                    className="block p-3 border rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">#{complaint.id} - {complaint.category}</p>
                        <p className="text-sm text-gray-600">{complaint.resident_name}</p>
                      </div>
                      <span className="text-sm text-red-600 font-medium">
                        Overdue
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Complaints */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No complaints yet</p>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    href={`/admin/complaints/${complaint.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">#{complaint.id} - {complaint.category}</p>
                        <p className="text-sm text-gray-600">{complaint.resident_name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}