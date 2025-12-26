'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if demo mode is enabled
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-check')
        const data = await response.json()
        if (data.demo === true) {
          setIsDemoMode(true)
          setEmail('admin@chatai.com')
          setPassword('123456')
        }
      } catch (error) {
        // If API doesn't exist, check environment variable on client side
        // Note: This is a fallback and won't work in production
        console.log('Demo check API not available')
      }
    }

    checkDemoMode()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1d] from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-[500px] grid items-center">
        {/* Login Form */}
        <div className="order-2 lg:order-1">
          <Card className="shadow-2xl bg-[#252728] backdrop-blur-sm border-0 rounded-3xl overflow-hidden pb-[20px]">
            <CardHeader className="text-white p-8 pb-6">
              <div className="text-center">

                <div className="flex justify-center items-center">
                  <Image
                    src="/images/favicon.png"
                    alt="Logo"
                    width={70}
                    height={100}
                  />
                </div>

                <CardTitle className="text-2xl font-bold mb-1">
                  Onfa Agent
                </CardTitle>
                <CardDescription className="text-indigo-100 text-lg">
                  AI hỗ trợ và chăm sóc khách hàng
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6 pt-[0]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-100">
                    Nhật Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-100">
                    Nhập Mật Khẩu
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-500 text-xl">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full min-h-[50px] !mt-[30px] font-semibold bg-[#e1b038] shadow-lg transform hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Chờ một chút...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Đăng nhập
                    </div>
                  )}
                </Button>
              </form>

              {/* Bottom Info Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free to Start Note */}
                <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-3 rounded-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-indigo-500 text-xl">🚀</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold ">
                        CSKH Nhanh Chóng
                      </p>
                    </div>
                  </div>
                </div>
                {/* Secured Note */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-3 rounded-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-purple-500 text-xl">🔒</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold ">
                        Bảo Mật Thông Tin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-4 flex items-center md:mb-2 md:mt-6"><div className="h-[1px] flex-1 bg-[#333b47]"></div><div className="px-4 text-white">Liên Hệ</div><div className="h-[1px] flex-1 bg-[#333b47]"></div></div>

              <div className="w-full h-auto  flex items-center justify-center gap-4 flex-wrap">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white group transition-all duration-300">
                  <a href="https://www.facebook.com/mettitechhue">
                    <svg className="transition-all duration-300 group-hover:scale-110"
                    xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 72 72" fill="none">
                    <path d="M46.4927 38.6403L47.7973 30.3588H39.7611V24.9759C39.7611 22.7114 40.883 20.4987 44.4706 20.4987H48.1756V13.4465C46.018 13.1028 43.8378 12.9168 41.6527 12.8901C35.0385 12.8901 30.7204 16.8626 30.7204 24.0442V30.3588H23.3887V38.6403H30.7204V58.671H39.7611V38.6403H46.4927Z" fill="#337FFF" />
                  </svg>
                  </a>
                </button>

                <button className="w-10 h-10 flex items-center justify-center group rounded-lg bg-white group transition-all duration-300">
                  <a href="https://www.instagram.com/p/DHWQgBMzYXL/">
                    <svg className="transition-all duration-300 group-hover:scale-110" width="28" height="28" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M27.4456 35.7808C27.4456 31.1786 31.1776 27.4468 35.7826 27.4468C40.3875 27.4468 44.1216 31.1786 44.1216 35.7808C44.1216 40.383 40.3875 44.1148 35.7826 44.1148C31.1776 44.1148 27.4456 40.383 27.4456 35.7808ZM22.9377 35.7808C22.9377 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM46.1342 22.4346C46.1339 23.0279 46.3098 23.608 46.6394 24.1015C46.9691 24.595 47.4377 24.9797 47.9861 25.2069C48.5346 25.4342 49.1381 25.4939 49.7204 25.3784C50.3028 25.2628 50.8378 24.9773 51.2577 24.5579C51.6777 24.1385 51.9638 23.6041 52.0799 23.0222C52.1959 22.4403 52.1367 21.8371 51.9097 21.2888C51.6828 20.7406 51.2982 20.2719 50.8047 19.942C50.3112 19.6122 49.7309 19.436 49.1372 19.4358H49.136C48.3402 19.4361 47.5771 19.7522 47.0142 20.3144C46.4514 20.8767 46.1349 21.6392 46.1342 22.4346ZM25.6765 56.1302C23.2377 56.0192 21.9121 55.6132 21.0311 55.2702C19.8632 54.8158 19.0299 54.2746 18.1538 53.4002C17.2777 52.5258 16.7354 51.6938 16.2827 50.5266C15.9393 49.6466 15.533 48.3214 15.4222 45.884C15.3009 43.2488 15.2767 42.4572 15.2767 35.781C15.2767 29.1048 15.3029 28.3154 15.4222 25.678C15.5332 23.2406 15.9425 21.918 16.2827 21.0354C16.7374 19.8682 17.2789 19.0354 18.1538 18.1598C19.0287 17.2842 19.8612 16.7422 21.0311 16.2898C21.9117 15.9466 23.2377 15.5406 25.6765 15.4298C28.3133 15.3086 29.1054 15.2844 35.7826 15.2844C42.4598 15.2844 43.2527 15.3106 45.8916 15.4298C48.3305 15.5408 49.6539 15.9498 50.537 16.2898C51.7049 16.7422 52.5382 17.2854 53.4144 18.1598C54.2905 19.0342 54.8308 19.8682 55.2855 21.0354C55.6289 21.9154 56.0351 23.2406 56.146 25.678C56.2673 28.3154 56.2915 29.1048 56.2915 35.781C56.2915 42.4572 56.2673 43.2466 56.146 45.884C56.0349 48.3214 55.6267 49.6462 55.2855 50.5266C54.8308 51.6938 54.2893 52.5266 53.4144 53.4002C52.5394 54.2738 51.7049 54.8158 50.537 55.2702C49.6565 55.6134 48.3305 56.0194 45.8916 56.1302C43.2549 56.2514 42.4628 56.2756 35.7826 56.2756C29.1024 56.2756 28.3125 56.2514 25.6765 56.1302ZM25.4694 10.9322C22.8064 11.0534 20.9867 11.4754 19.3976 12.0934C17.7518 12.7316 16.3585 13.5878 14.9663 14.977C13.5741 16.3662 12.7195 17.7608 12.081 19.4056C11.4626 20.9948 11.0403 22.8124 10.9191 25.4738C10.7958 28.1394 10.7676 28.9916 10.7676 35.7808C10.7676 42.57 10.7958 43.4222 10.9191 46.0878C11.0403 48.7494 11.4626 50.5668 12.081 52.156C12.7195 53.7998 13.5743 55.196 14.9663 56.5846C16.3583 57.9732 17.7518 58.8282 19.3976 59.4682C20.9897 60.0862 22.8064 60.5082 25.4694 60.6294C28.138 60.7506 28.9893 60.7808 35.7826 60.7808C42.5759 60.7808 43.4286 60.7526 46.0958 60.6294C48.759 60.5082 50.5774 60.0862 52.1676 59.4682C53.8124 58.8282 55.2066 57.9738 56.5989 56.5846C57.9911 55.1954 58.8438 53.7998 59.4842 52.156C60.1026 50.5668 60.5268 48.7492 60.6461 46.0878C60.7674 43.4202 60.7956 42.57 60.7956 35.7808C60.7956 28.9916 60.7674 28.1394 60.6461 25.4738C60.5248 22.8122 60.1026 20.9938 59.4842 19.4056C58.8438 17.7618 57.9889 16.3684 56.5989 14.977C55.2088 13.5856 53.8124 12.7316 52.1696 12.0934C50.5775 11.4754 48.7588 11.0514 46.0978 10.9322C43.4306 10.811 42.5779 10.7808 35.7846 10.7808C28.9913 10.7808 28.138 10.809 25.4694 10.9322Z" fill="url(#paint0_radial_7092_54471)" />
                    <path d="M27.4456 35.7808C27.4456 31.1786 31.1776 27.4468 35.7826 27.4468C40.3875 27.4468 44.1216 31.1786 44.1216 35.7808C44.1216 40.383 40.3875 44.1148 35.7826 44.1148C31.1776 44.1148 27.4456 40.383 27.4456 35.7808ZM22.9377 35.7808C22.9377 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM46.1342 22.4346C46.1339 23.0279 46.3098 23.608 46.6394 24.1015C46.9691 24.595 47.4377 24.9797 47.9861 25.2069C48.5346 25.4342 49.1381 25.4939 49.7204 25.3784C50.3028 25.2628 50.8378 24.9773 51.2577 24.5579C51.6777 24.1385 51.9638 23.6041 52.0799 23.0222C52.1959 22.4403 52.1367 21.8371 51.9097 21.2888C51.6828 20.7406 51.2982 20.2719 50.8047 19.942C50.3112 19.6122 49.7309 19.436 49.1372 19.4358H49.136C48.3402 19.4361 47.5771 19.7522 47.0142 20.3144C46.4514 20.8767 46.1349 21.6392 46.1342 22.4346ZM25.6765 56.1302C23.2377 56.0192 21.9121 55.6132 21.0311 55.2702C19.8632 54.8158 19.0299 54.2746 18.1538 53.4002C17.2777 52.5258 16.7354 51.6938 16.2827 50.5266C15.9393 49.6466 15.533 48.3214 15.4222 45.884C15.3009 43.2488 15.2767 42.4572 15.2767 35.781C15.2767 29.1048 15.3029 28.3154 15.4222 25.678C15.5332 23.2406 15.9425 21.918 16.2827 21.0354C16.7374 19.8682 17.2789 19.0354 18.1538 18.1598C19.0287 17.2842 19.8612 16.7422 21.0311 16.2898C21.9117 15.9466 23.2377 15.5406 25.6765 15.4298C28.3133 15.3086 29.1054 15.2844 35.7826 15.2844C42.4598 15.2844 43.2527 15.3106 45.8916 15.4298C48.3305 15.5408 49.6539 15.9498 50.537 16.2898C51.7049 16.7422 52.5382 17.2854 53.4144 18.1598C54.2905 19.0342 54.8308 19.8682 55.2855 21.0354C55.6289 21.9154 56.0351 23.2406 56.146 25.678C56.2673 28.3154 56.2915 29.1048 56.2915 35.781C56.2915 42.4572 56.2673 43.2466 56.146 45.884C56.0349 48.3214 55.6267 49.6462 55.2855 50.5266C54.8308 51.6938 54.2893 52.5266 53.4144 53.4002C52.5394 54.2738 51.7049 54.8158 50.537 55.2702C49.6565 55.6134 48.3305 56.0194 45.8916 56.1302C43.2549 56.2514 42.4628 56.2756 35.7826 56.2756C29.1024 56.2756 28.3125 56.2514 25.6765 56.1302ZM25.4694 10.9322C22.8064 11.0534 20.9867 11.4754 19.3976 12.0934C17.7518 12.7316 16.3585 13.5878 14.9663 14.977C13.5741 16.3662 12.7195 17.7608 12.081 19.4056C11.4626 20.9948 11.0403 22.8124 10.9191 25.4738C10.7958 28.1394 10.7676 28.9916 10.7676 35.7808C10.7676 42.57 10.7958 43.4222 10.9191 46.0878C11.0403 48.7494 11.4626 50.5668 12.081 52.156C12.7195 53.7998 13.5743 55.196 14.9663 56.5846C16.3583 57.9732 17.7518 58.8282 19.3976 59.4682C20.9897 60.0862 22.8064 60.5082 25.4694 60.6294C28.138 60.7506 28.9893 60.7808 35.7826 60.7808C42.5759 60.7808 43.4286 60.7526 46.0958 60.6294C48.759 60.5082 50.5774 60.0862 52.1676 59.4682C53.8124 58.8282 55.2066 57.9738 56.5989 56.5846C57.9911 55.1954 58.8438 53.7998 59.4842 52.156C60.1026 50.5668 60.5268 48.7492 60.6461 46.0878C60.7674 43.4202 60.7956 42.57 60.7956 35.7808C60.7956 28.9916 60.7674 28.1394 60.6461 25.4738C60.5248 22.8122 60.1026 20.9938 59.4842 19.4056C58.8438 17.7618 57.9889 16.3684 56.5989 14.977C55.2088 13.5856 53.8124 12.7316 52.1696 12.0934C50.5775 11.4754 48.7588 11.0514 46.0978 10.9322C43.4306 10.811 42.5779 10.7808 35.7846 10.7808C28.9913 10.7808 28.138 10.809 25.4694 10.9322Z" fill="url(#paint1_radial_7092_54471)" />
                    <defs>
                      <radialGradient id="paint0_radial_7092_54471" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17.4144 61.017) scale(65.31 65.2708)">
                        <stop offset="0.09" stop-color="#FA8F21" />
                        <stop offset="0.78" stop-color="#D82D7E" />
                      </radialGradient>
                      <radialGradient id="paint1_radial_7092_54471" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(41.1086 63.257) scale(51.4733 51.4424)">
                        <stop offset="0.64" stop-color="#8C3AAA" stop-opacity="0" />
                        <stop offset="1" stop-color="#8C3AAA" />
                      </radialGradient>
                    </defs>
                  </svg>
                  </a>
                </button>

                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white group transition-all duration-300">
                  <a href="https://www.facebook.com/messages/t/465040566689628">
                    <svg className="rounded-md transition-all duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 72 72" fill="none">
                    <path d="M35.9042 13C23.0034 13 13 22.4537 13 35.2171C13 41.8936 15.737 47.6655 20.1919 51.6508C20.5641 51.9829 20.7931 52.4525 20.8046 52.9563L20.9306 57.0333C20.9397 57.3333 21.0225 57.6264 21.1714 57.8869C21.3204 58.1474 21.5311 58.3674 21.785 58.5274C22.0389 58.6874 22.3282 58.7826 22.6275 58.8047C22.9268 58.8267 23.227 58.7749 23.5016 58.6538L28.048 56.6496C28.4317 56.4779 28.8669 56.4492 29.2734 56.558C31.3634 57.1306 33.5851 57.4398 35.9042 57.4398C48.805 57.4398 58.8084 47.9861 58.8084 35.2228C58.8084 22.4594 48.805 13 35.9042 13Z" fill="url(#paint0_radial_7092_54580)" />
                    <path d="M22.1502 41.7161L28.8783 31.0428C29.1314 30.6409 29.4651 30.2959 29.8583 30.0295C30.2514 29.7631 30.6955 29.5812 31.1626 29.4951C31.6296 29.409 32.1094 29.4206 32.5717 29.5293C33.034 29.638 33.4688 29.8414 33.8485 30.1266L39.2024 34.1406C39.4414 34.3195 39.7322 34.4157 40.0308 34.4147C40.3293 34.4137 40.6194 34.3154 40.8572 34.1348L48.0835 28.6493C49.0455 27.9163 50.3052 29.073 49.6639 30.098L42.93 40.7656C42.6769 41.1674 42.3433 41.5124 41.9501 41.7788C41.5569 42.0452 41.1128 42.2272 40.6458 42.3133C40.1787 42.3994 39.6989 42.3877 39.2366 42.279C38.7743 42.1703 38.3396 41.967 37.9598 41.6818L32.606 37.6678C32.367 37.4889 32.0762 37.3926 31.7776 37.3937C31.479 37.3947 31.1889 37.4929 30.9512 37.6735L23.7249 43.1591C22.7629 43.892 21.5032 42.7411 22.1502 41.7161Z" fill="white" />
                    <defs>
                      <radialGradient id="paint0_radial_7092_54580" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20.6729 58.8084) scale(50.3892 50.3892)">
                        <stop stop-color="#0099FF" />
                        <stop offset="0.6" stop-color="#A033FF" />
                        <stop offset="0.9" stop-color="#FF5280" />
                        <stop offset="1" stop-color="#FF7061" />
                      </radialGradient>
                    </defs>
                  </svg>
                  </a>
                </button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
