export interface SubscriptionActivity {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  membership_id: number;
  membership?: {
    id: number;
    status: string;
    start_date: Date | string;
    end_date: Date | string;
    membership_level: {
      id: number;
      name: string;
      price: number;
    };
  };
  activity_type: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'EXPIRED' | 'RENEWED';
  description: string;
  created_at: Date | string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  cancelled_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
}
