'use client'

import Link from 'next/link'
import { ShieldAlert, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to view this page. This area is restricted to administrators only.
        </p>
        <div className="space-y-3 pt-4 border-t">
          <Link
            href="/resident/dashboard"
            className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4 inline mr-2" />
            Go to Resident Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}