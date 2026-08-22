'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import apiService from '../../../../src/lib/api'
import { Complaint, ComplaintStatus } from '../../../../src/types'
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Save
} from 'lucide-react'

export default function AdminComplaintDetails() {
  const params = useParams()
  const router = useRouter()
  const { user, logout, isAdmin, isLoading } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [status, setStatus] = useState<ComplaintStatus>('OPEN')
  const [priority, setPriority] = useState<string>('MEDIUM')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 🔒 CRITICAL: Check if user is admin, redirect if not
  useEffect(() => {
    if (isLoading) return

    if (!isAdmin && !isRedirecting) {
      setIsRedirecting(true)
      router.replace('/unauthorized')
      return
    }

    if (isAdmin) {
      fetchComplaint()
    }
  }, [isAdmin, isLoading, router, isRedirecting])

  const fetchComplaint = async () => {
    try {
      const data = await apiService.getComplaint(Number(params.id))
      setComplaint(data)
      setStatus(data.status)
      setPriority(data.priority)
    } catch (err: any) {
      setError('Failed to load complaint')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      await apiService.updateStatus(Number(params.id), status, note)
      setSuccess('Status updated successfully!')
      await fetchComplaint()
      setNote('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handlePriorityUpdate = async (newPriority: string) => {
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      await apiService.updatePriority(Number(params.id), newPriority)
      setSuccess('Priority updated successfully!')
      await fetchComplaint()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update priority')
    } finally {
      setUpdating(false)
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

  if (error && !complaint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Complaint not found</div>
      </div>
    )
  }

  const isResolved = complaint.status === 'RESOLVED'

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
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Dashboard
            </Link>
            <Link
              href="/admin/complaints"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <FileText className="mr-3 h-5 w-5 text-blue-500" />
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
            <div className="flex items-center">
              <Link
                href="/admin/complaints"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Complaint #{complaint.id}
              </h1>
            </div>
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
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaint Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-semibold">{complaint.category}</h2>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      {complaint.is_overdue && (
                        <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Resident: {complaint.resident_name}
                    </p>
                    <p className={`text-sm font-medium ${complaint.priority === 'HIGH' ? 'text-red-600' : complaint.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                      Priority: {complaint.priority}
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
                  {complaint.history.map((entry) => (
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

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Update Status</h3>
                {isResolved ? (
                  <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg text-center">
                    ✅ This complaint is resolved
                  </div>
                ) : (
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Note (Optional)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        placeholder="Add a note about this update..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updating ? (
                        'Updating...'
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Status
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Priority Update */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Update Priority</h3>
                <div className="space-y-2">
                  {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePriorityUpdate(p)}
                      disabled={updating || isResolved}
                      className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                        complaint.priority === p
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      } ${(updating || isResolved) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {isResolved && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Cannot update priority of resolved complaint
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}