'use client';

import {
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import constants from '@/lib/constants';
import { Play } from '@/lib/types/play';
import { DashboardData } from '@/lib/types/user';

import QuickActionsPanel from '@/components/producer/QuickActionsPanel';
import RecentActivities from '@/components/producer/RecentActivities';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/ui/DashboardHeader';
import { Spinner } from '@/components/ui/Spinner';
import StatsGrid from '@/components/ui/StatsGrid';
import TopBanner from '@/components/ui/TopBanner';

import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
import LimitationsByRole from '@/app/components/users/LimitationsByRole';
import { useAuth } from '@/contexts/AuthContext';

export default function ProducerDashboard() {
  useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
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
      setPlays(data.plays);
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
    return <Spinner color='red' />;
  }

  console.log(plays);

  return (
    <ProtectedRoute allowedRoles={['productor']}>
      <div
        className={`min-h-screen ${constants.roles.ui.background.productor}`}
      >
        {/* Header */}
        <DashboardHeader
          icon={dashboardData?.icon || constants.roles.emojis.productor}
          title={dashboardData?.title || 'Dashboard Productor'}
          color={constants.roles.ui.colorKeyByRole.productor}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {dashboardData && (
            <>
              {/* Welcome Message */}
              <TopBanner
                title={dashboardData.title}
                message={dashboardData.message}
                icon={dashboardData.icon}
                borderColor={constants.roles.ui.border.productor}
              />

              {/* Quick Stats */}
              <StatsGrid
                items={[
                  {
                    icon: <PlayIcon className='w-5 h-5' />,
                    title: 'Mis Obras',
                    value: 3,
                    color: 'red',
                  },
                  {
                    icon: <CalendarIcon className='h-8 w-8' />,
                    title: 'Funciones',
                    value: 12,
                    color: 'orange',
                  },
                  {
                    icon: <UsersIcon className='h-8 w-8' />,
                    title: 'Directores',
                    value: 8,
                    color: 'blue',
                  },
                  {
                    icon: <ChartBarIcon className='h-8 w-8' />,
                    title: 'Espectadores',
                    value: 245,
                    color: 'green',
                  },
                ]}
              />

              {/* Quick Actions */}
              <QuickActionsPanel />

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
