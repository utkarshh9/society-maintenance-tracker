'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../../src/types'
import apiService from '../../src/lib/api'

// Helper to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

// Helper to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      
      // Also set cookies for middleware
      setCookie('token', storedToken)
      setCookie('user', storedUser)
      
      apiService.getCurrentUser()
        .then((userData) => {
          setUser(userData)
          const userStr = JSON.stringify(userData)
          localStorage.setItem('user', userStr)
          setCookie('user', userStr)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          deleteCookie('token')
          deleteCookie('user')
          setToken(null)
          setUser(null)
        })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password)
    const { access_token, user } = response
    
    setToken(access_token)
    setUser(user)
    
    const userStr = JSON.stringify(user)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', userStr)
    
    // Set cookies for middleware
    setCookie('token', access_token)
    setCookie('user', userStr)
  }

  const register = async (name: string, email: string, password: string) => {
    await apiService.register({ name, email, password })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    deleteCookie('token')
    deleteCookie('user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}