'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, MessageSquare, Bot, Calendar, Key, TrendingUp, Activity, RefreshCw, LogOut, Settings, User, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';

interface AnalyticsData {
  totalBots: number
  totalMessages: number
  lastLogin: string
  accountCreated: string
  accountAgeDays: number
  hasApiKey: boolean
  apiKeyLength: number
}

export default function StatisticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBots: 0,
    totalMessages: 0,
    lastLogin: 'Loading...',
    accountCreated: 'Loading...',
    accountAgeDays: 0,
    hasApiKey: false,
    apiKeyLength: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, router])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user-analytics')
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data:', data)
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
      setIsPageLoading(false)
    }
  }

  if (status === 'loading' || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1c1d] from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#1c1c1d] from-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#1c1c1d] from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>

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
                <p className="text-xs text-gray-500">Administrator</p>
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Bảng điều khiển</h2>
              <p className="text-gray-400">Tổng quan về việc sử dụng và hiệu suất Agent</p>
            </div>
            <Button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bots */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Tổng số Agent</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalBots}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Processed */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Tin nhắn đã xử lý</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.totalMessages.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Active */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Số ngày hoạt động</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.accountAgeDays}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key Status */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Trạng thái khóa API</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.hasApiKey ? '✓' : '✗'}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardHeader className="bg-[#e1b038] text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Thông tin tài khoản</CardTitle>
                  <CardDescription className="text-indigo-100">Chi tiết và trạng thái tài khoản của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Ngày tạo tài khoản</span>
                  <span className="text-sm text-gray-400">{analytics.accountCreated}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Lần đăng nhập cuối</span>
                  <span className="text-sm text-gray-400">{analytics.lastLogin}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Thời gian hoạt động</span>
                  <span className="text-sm text-gray-400">{analytics.accountAgeDays} ngày</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-300">Email</span>
                  <span className="text-sm text-gray-400">{session?.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Cấu hình API</CardTitle>
                  <CardDescription className="text-green-100">Chi tiết và trạng thái khóa API OpenAI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Trạng thái khóa API</span>
                  <span className={`text-sm font-medium ${analytics.hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.hasApiKey ? 'Đã cấu hình' : 'Chưa cấu hình'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Độ dài khóa</span>
                  <span className="text-sm text-gray-400">{analytics.apiKeyLength} ký tự</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-300">Nhà cung cấp</span>
                  <span className="text-sm text-gray-400">OpenAI</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-300">Mô hình</span>
                  <span className="text-sm text-gray-400">gpt-4o-mini</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Chỉ số hiệu suất</CardTitle>
                  <CardDescription className="text-purple-100">Thống kê sử dụng và chỉ số hiệu suất</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.totalBots > 0 ? (analytics.totalMessages / analytics.totalBots).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-gray-300">Tin nhắn TB mỗi Agent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.accountAgeDays > 0 ? (analytics.totalMessages / analytics.accountAgeDays).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-gray-300">Tin nhắn mỗi ngày</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.hasApiKey ? '100%' : '0%'}
                  </div>
                  <div className="text-sm text-gray-300">Sức khỏe hệ thống</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
