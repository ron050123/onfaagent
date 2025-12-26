'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[#1c1c1d] from-blue-50 to-indigo-100">
      
    </div>
  )
}
