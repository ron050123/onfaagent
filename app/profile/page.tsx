'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut, getSession, signIn } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Calendar, Shield, Activity, Eye, EyeOff, Save, CheckCircle, AlertCircle, Settings, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react'
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    newName: '',
    newEmail: '',
    newPassword: ''
  })
  
  // Debug form data changes
  useEffect(() => {
    console.log('Debug - formData changed:', formData)
  }, [formData])
  const [userData, setUserData] = useState<any>(null)
  const [isDemo, setIsDemo] = useState(false)

  // Load user data when component mounts
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
      checkDemoMode()
    }
  }, [session])

  // Pre-fill form with current values when userData is loaded
  useEffect(() => {
    console.log('Debug - userData changed:', userData)
    if (userData) {
      setFormData(prev => ({
        newName: userData.name || '',
        newEmail: userData.email || '',
        newPassword: prev.newPassword // Keep current password value if user is typing
      }))
    }
  }, [userData])

  const fetchUserData = async (useNewEmail = null) => {
    setIsLoadingData(true)
    try {
      let response;
      
      if (useNewEmail) {
        // If we have a new email, fetch user data by email
        response = await fetch('/api/user-by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: useNewEmail })
        })
      } else {
        // Use the regular debug-user API with session
        response = await fetch('/api/debug-user')
      }
      
      if (response.ok) {
        const data = await response.json()
        console.log('Debug - API Response:', data)
        
        if (useNewEmail) {
          // Direct user data from user-by-email API
          setUserData(data)
        } else {
          // Nested structure from debug-user API
          setUserData(data.user)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoadingData(false)
      setIsPageLoading(false)
    }
  }

  const checkDemoMode = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setIsDemo(data.isDemo || false)
      }
    } catch (error) {
      console.error('Error checking demo mode:', error)
    }
  }

  if (status === 'loading' || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1c1d] from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleUpdate = async () => {
    if (formData.newEmail && !formData.newEmail.includes('@')) {
      setError('Please enter a valid email address')
      setTimeout(() => setError(''), 5000)
      return
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setTimeout(() => setError(''), 5000)
      return
    }

    if (!formData.newName && !formData.newEmail && !formData.newPassword) {
      setError('Please enter at least one field to update')
      setTimeout(() => setError(''), 5000)
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: formData.newName || undefined,
          newEmail: formData.newEmail || undefined,
          newPassword: formData.newPassword || undefined
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(result.message)
        
        // Refresh user data from database (session will now have fresh data)
        await fetchUserData()
        
        // Update form data with current values
        setFormData(prev => ({
          ...prev,
          newPassword: '' // Clear password field
        }))
        
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      setError('Failed to update profile')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1d] from-blue-50 to-indigo-100">

      {/* Header */}
      <div className="relative bg-[#252728] backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image 
                src="/images/logo-onfa-scaled.png" 
                alt="Logo" 
                width={150} 
                height={100} 
              />
            </div>
            
            {/* Menu Items */}
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="hidden sm:block text-right mr-4">
                <p className="text-sm font-semibold text-white">{session?.user?.email}</p>
                <p className="text-xs text-gray-300">Administrator</p>
              </div>
              
              {/* Menu Items */}
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className={`flex items-center space-x-2 bg-[#333b47] backdrop-blur-sm text-white border-2 px-[12px] hover:bg-white/90 hover:border-b-indigo-300 shadow-lg relative ${
                  pathname === '/dashboard' 
                    ? 'border-[#333b47] border-b-2 border-b-indigo-500' 
                    : 'border-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:block">All Agents</span>
              </Button>
              
              <Button
                onClick={() => router.push('/statistics')}
                variant="outline"
                className={`flex items-center space-x-2 bg-[#333b47] backdrop-blur-sm text-white border-2 px-[12px] hover:bg-white/90 hover:border-b-indigo-300 shadow-lg relative ${
                  pathname === '/statistics' 
                    ? 'border-[#333b47] border-b-2 border-b-indigo-500' 
                    : 'border-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:block">Analytics</span>
              </Button>
              
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className={`flex items-center space-x-2 bg-[#333b47] backdrop-blur-sm text-white border-2 px-[12px] hover:bg-white/90 hover:border-b-indigo-300 shadow-lg relative ${
                  pathname === '/settings' 
                    ? 'border-[#333b47] border-b-2 border-b-indigo-500' 
                    : 'border-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:block">Settings</span>
              </Button>
              
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
                className={`flex items-center space-x-2 bg-[#333b47] backdrop-blur-sm text-white border-2 px-[12px] hover:bg-white/90 hover:border-b-indigo-300 shadow-lg relative ${
                  pathname === '/profile' 
                    ? 'border-[#333b47] border-b-2 border-b-indigo-500' 
                    : 'border-gray-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Profile</span>
              </Button>
              
              <Button
                onClick={() => signOut()}
                className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-md shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 text-lg mr-2" />
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 rounded-md shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 text-lg mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Demo Mode Indicator */}
          {isDemo && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 rounded-md shadow-lg">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-500 text-lg mr-2" />
                <div>
                  <p className="font-semibold">Chế độ Demo Đang Hoạt Động</p>
                  <p className="text-sm">Bạn đang xem ứng dụng ở chế độ demo. Thông tin hồ sơ không thể chỉnh sửa.</p>
                </div>
              </div>
            </div>
          )}
          {/* Update Profile */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-md overflow-hidden">
            <CardHeader className="bg-[#e1b038] text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Chỉnh sửa Hồ sơ</CardTitle>
                  <CardDescription className="text-indigo-100">Chỉnh sửa thông tin hồ sơ của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Edit Profile Form */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Chỉnh sửa Thông tin Hồ sơ
                  {isLoadingData && (
                    <span className="ml-2 text-sm text-gray-300">Đang tải...</span>
                  )}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-name" className="text-sm font-semibold text-gray-100 mb-2 block">
                      Tên
                    </Label>
                    <Input
                      id="new-name"
                      type="text"
                      value={isDemo ? "Người dùng Demo" : formData.newName}
                      onChange={(e) => !isDemo && setFormData({...formData, newName: e.target.value})}
                      className="border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={isDemo ? "Người dùng Demo" : "Nhập tên của bạn"}
                      disabled={isLoadingData || isDemo}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-email" className="text-sm font-semibold text-gray-100 mb-2 block">
                      Địa chỉ Email
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={isDemo ? "demo@example.com" : formData.newEmail}
                      onChange={(e) => !isDemo && setFormData({...formData, newEmail: e.target.value})}
                      className="border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={isDemo ? "demo@example.com" : "Nhập địa chỉ email của bạn"}
                      disabled={isLoadingData || isDemo}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password" className="text-sm font-semibold text-gray-100 mb-2 block">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={isDemo ? "••••••••" : formData.newPassword}
                    onChange={(e) => !isDemo && setFormData({...formData, newPassword: e.target.value})}
                    className="pr-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={isDemo ? "••••••••" : "Nhập mật khẩu mới (để trống nếu giữ nguyên)"}
                    disabled={isLoadingData || isDemo}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-300 mt-1">Phải có ít nhất 6 ký tự</p>
              </div>

              <Button
                onClick={handleUpdate}
                disabled={isLoading || isLoadingData || isDemo || (!formData.newName && !formData.newEmail && !formData.newPassword)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-md shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                {isDemo ? 'Cập nhật Hồ sơ (Demo)' : (isLoading ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ')}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
