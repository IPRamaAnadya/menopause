'use client';

import { ProtectedRoute, useAuth } from '@/features/auth';
import { Activity, Calendar, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-muted-foreground mt-2">
            Track your menopause journey and health insights
          </p>
        </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Symptoms Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Symptoms Logged</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12%
            </span>
            <span className="text-xs text-muted-foreground">from last week</span>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Appointments</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-blue-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              2 upcoming
            </span>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
        </div>

        {/* Articles Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Articles Read</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
              <FileText className="h-6 w-6 text-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-purple-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3 new
            </span>
            <span className="text-xs text-muted-foreground">recommended for you</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Symptom logged</p>
                <p className="text-xs text-muted-foreground">Hot flash - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-muted-foreground">Dr. Smith - Tomorrow 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Article saved</p>
                <p className="text-xs text-muted-foreground">Managing Sleep Patterns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">Manage your health with ease</p>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Log New Symptom
            </button>
            <button className="w-full rounded-lg border border-secondary bg-background px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10">
              View Health Reports
            </button>
            <button className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent/10">
              Browse Articles
            </button>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
