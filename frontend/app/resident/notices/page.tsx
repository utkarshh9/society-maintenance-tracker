'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../../src/lib/api'
import { Notice } from '../../../src/types'
import { ArrowLeft, Bell, Star } from 'lucide-react'

export default function ResidentNotices() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const data = await apiService.getNotices()
      setNotices(data)
    } catch (error) {
      console.error('Error fetching notices:', error)
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

  const importantNotices = notices.filter(n => n.is_important)
  const regularNotices = notices.filter(n => !n.is_important)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
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
          href="/resident/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Important Notices */}
        {importantNotices.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold flex items-center text-yellow-700 mb-4">
              <Star className="h-5 w-5 mr-2 fill-current" />
              Important Notices
            </h2>
            <div className="space-y-4">
              {importantNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-yellow-800">{notice.title}</h3>
                  <p className="text-yellow-700 mt-2">{notice.content}</p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Posted on {new Date(notice.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notices */}
        <div>
          <h2 className="text-lg font-semibold flex items-center text-gray-700 mb-4">
            <Bell className="h-5 w-5 mr-2" />
            All Notices
          </h2>
          {regularNotices.length === 0 && importantNotices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No notices available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {regularNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                  <p className="text-gray-600 mt-2">{notice.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted on {new Date(notice.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}