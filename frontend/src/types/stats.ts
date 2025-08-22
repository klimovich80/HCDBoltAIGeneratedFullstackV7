export interface DashboardStats {
  totalHorses: number;
  upcomingLessons: number;
  activeEvents: number;
  pendingPayments: number;
  totalMembers: number;
  monthlyRevenue: number;
  newHorsesThisMonth: number;
  newLessonsThisWeek: number;
  newMembersThisMonth: number;
  pendingPaymentsAmount: number;
  revenueGrowthPercent: number;
  upcomingEvents: Array<{
    title: string;
    date: string;
    participants: string;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    user?: string;
    amount?: number;
    timestamp: string;
    color: string;
  }>;
}

export interface OverviewStats {
  newUsersLast30Days: number;
  upcomingLessons: number;
  totalRevenue: number;
}

export interface StatsResponse {
  success: boolean;
  data?: DashboardStats;
  message?: string;
}