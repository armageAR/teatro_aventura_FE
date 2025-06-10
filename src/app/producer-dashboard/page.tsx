'use client';

import {
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import { Play } from '@/lib/types/play';
import { DashboardData } from '@/lib/types/user';

import RecentActivities from '@/components/producer/RecentActivities';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickActions from '@/components/QuickActions';
import StatCard from '@/components/StatCard';
import { ButtonLogout, ButtonStart } from '@/components/ui/buttons';
import { Spinner } from '@/components/ui/Spinner';
import TopBanner from '@/components/ui/TopBanner';

import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
import LimitationsByRole from '@/app/components/users/LimitationsByRole';
import { useAuth } from '@/contexts/AuthContext';

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await authAPI.getProducerDashboard();
      setDashboardData(data);
    } catch (error: unknown) {
      const errorMessage = 'Error al cargar los datos del dashboard';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlays = async () => {
    try {
      const data = await authAPI.getPlays();
      console.log(data);
      setPlays(data.data);
    } catch (error: unknown) {
      const errorMessage = 'Error al cargar las obras';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPlays();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  console.log(plays);

  return (
    <ProtectedRoute allowedRoles={['productor']}>
      <div className='min-h-screen bg-red-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-red-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <div className='text-3xl mr-3'>{dashboardData?.icon}</div>
                <div>
                  <h1 className='text-2xl font-bold text-red-800'>
                    {dashboardData?.title}
                  </h1>
                  <p className='text-red-600'>Bienvenido, {user?.name}</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <ButtonStart />
                <ButtonLogout />
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {dashboardData && (
            <>
              {/* Welcome Message */}
              <TopBanner
                title={dashboardData.title}
                message={dashboardData.message}
                icon={dashboardData.icon}
                borderColor='border-red-500'
              />

              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <StatCard
                  icon={<PlayIcon className='w-5 h-5' />}
                  title='Mis Obras'
                  value={3}
                  color='red'
                />
                <StatCard
                  icon={<CalendarIcon className='h-8 w-8' />}
                  title='Funciones'
                  value={12}
                  color='orange'
                />

                <StatCard
                  icon={<UsersIcon className='h-8 w-8' />}
                  title='Directores'
                  value={8}
                  color='blue'
                />
                <StatCard
                  icon={<ChartBarIcon className='h-8 w-8' />}
                  title='Espectadores'
                  value={245}
                  color='green'
                />
              </div>

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity */}
              <RecentActivities />

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <CapabilitiesByRole capabilities={dashboardData.capabilities} />
                <LimitationsByRole limitations={dashboardData.limitations} />
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
