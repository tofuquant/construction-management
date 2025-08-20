"use client"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { WorkerDashboard } from "@/components/worker-dashboard"
import { CoordinatorDashboard } from "@/components/coordinator-dashboard"
import { SchedulerDashboard } from "@/components/scheduler-dashboard"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case "admin":
      return <AdminDashboard />
    case "coordinator":
      return <CoordinatorDashboard />
    case "scheduler":
      return <SchedulerDashboard />
    case "worker":
      return <WorkerDashboard />
    default:
      return <LoginForm />
  }
}
