"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Award, Calendar, CreditCard, CheckCircle2, ArrowUp, ArrowDown, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MembershipLevel {
  id: number;
  name: string;
  slug: string;
  priority: number;
  price: number;
  duration_days: number;
}

interface CurrentMembership {
  id: number;
  user_id: number;
  membership_level_id: number;
  start_date: string;
  end_date: string;
  status: string;
  membership_level: MembershipLevel;
}

interface SubscriptionActivity {
  id: number;
  user_id: number;
  membership_id: number;
  membership: {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
    membership_level: {
      id: number;
      name: string;
      price: number;
    };
  };
  activity_type: string;
  description: string;
  created_at: string;
}

export default function SubscriptionPage() {
  const t = useTranslations("Member");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null);
  const [availableLevels, setAvailableLevels] = useState<MembershipLevel[]>([]);
  const [activities, setActivities] = useState<SubscriptionActivity[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membershipRes, levelsRes] = await Promise.all([
        fetch('/api/member/memberships/current'),
        fetch('/api/member/memberships/available'),
      ]);

      const membershipData = await membershipRes.json();
      const levelsData = await levelsRes.json();

      if (membershipData.success) {
        setCurrentMembership(membershipData.data);
      }

      if (levelsData.success) {
        setAvailableLevels(levelsData.data);
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: t('subscription.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', activityPage.toString());
      params.append('limit', '5');

      const activityRes = await fetch(`/api/member/subscription/activity?${params.toString()}`);
      const activityData = await activityRes.json();

      if (activityData.success) {
        if (activityData.data.data) {
          setActivities(activityData.data.data);
          setActivityPagination(activityData.data.pagination);
        } else {
          // Old response format (array)
          setActivities(activityData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchActivities();
    }
  }, [activityPage]);

  const handleCheckout = async (levelId: number, operationType: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/member/memberships/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membership_level_id: levelId,
          operation_type: operationType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.free && data.data.redirectUrl) {
          // Free membership, redirect to success page
          toast({
            title: t('success'),
            description: t('subscription.freeSuccess'),
          });
          window.location.href = data.data.redirectUrl;
        } else if (data.data.url) {
          // Paid membership, redirect to Stripe checkout
          window.location.href = data.data.url;
        } else {
          toast({
            title: t('error'),
            description: data.message || t('subscription.checkoutError'),
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('error'),
          description: data.message || t('subscription.checkoutError'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('error'),
        description: t('subscription.checkoutError'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getOperationType = (level: MembershipLevel) => {
    if (!currentMembership) return 'NEW';
    if (level.id === currentMembership.membership_level_id) return 'EXTEND';
    if (level.priority > currentMembership.membership_level.priority) return 'UPGRADE';
    return 'DOWNGRADE';
  };

  const getOperationLabel = (level: MembershipLevel) => {
    const type = getOperationType(level);
    if (type === 'EXTEND') return t('subscription.extend');
    if (type === 'UPGRADE') return t('subscription.upgrade');
    if (type === 'DOWNGRADE') return t('subscription.downgrade');
    return t('subscription.purchase');
  };

  const getOperationIcon = (level: MembershipLevel) => {
    const type = getOperationType(level);
    if (type === 'EXTEND') return <Clock className="h-4 w-4" />;
    if (type === 'UPGRADE') return <ArrowUp className="h-4 w-4" />;
    if (type === 'DOWNGRADE') return <ArrowDown className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("subscription.title")}</h1>
        <p className="text-muted-foreground">{t("subscription.description")}</p>
      </div>

      {/* Current Subscription */}
      {currentMembership && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {currentMembership.membership_level.name}
                </CardTitle>
                <CardDescription>{t("subscription.planDescription")}</CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                {currentMembership.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  {t("subscription.startDate")}
                </p>
                <p className="text-lg font-semibold">
                  {new Date(currentMembership.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  {t("subscription.endDate")}
                </p>
                <p className="text-lg font-semibold">
                  {new Date(currentMembership.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">{t("subscription.benefits")}</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>{t("subscription.benefit1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>{t("subscription.benefit2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>{t("subscription.benefit3")}</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {availableLevels.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{t("subscription.availablePlans")}</h2>
            <p className="text-muted-foreground">{t("subscription.availablePlansDescription")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableLevels.map((level) => {
              const operationType = getOperationType(level);
              const isCurrent = currentMembership?.membership_level_id === level.id;

              return (
                <Card key={level.id} className={isCurrent ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{level.name}</CardTitle>
                      {isCurrent && (
                        <Badge variant="outline" className="ml-2">
                          {t('subscription.current')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {level.duration_days} {t('subscription.days')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">
                      HK${level.price.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => handleCheckout(level.id, operationType)}
                      disabled={processing}
                      className="w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        getOperationIcon(level)
                      )}
                      {processing ? t('subscription.processing') : getOperationLabel(level)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscription Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("subscription.activityHistory")}
          </CardTitle>
          <CardDescription>{t("subscription.activityDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("subscription.noActivity")}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activity.activity_type === 'NEW' || activity.activity_type === 'EXTEND' || activity.activity_type === 'UPGRADE'
                            ? 'default'
                            : activity.activity_type === 'DOWNGRADE'
                            ? 'secondary'
                            : activity.activity_type === 'CANCELLED'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {activity.activity_type}
                      </Badge>
                      <span className="font-medium">
                        {activity.membership.membership_level.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()} -{' '}
                      {new Date(activity.membership.start_date).toLocaleDateString()} to{' '}
                      {new Date(activity.membership.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      HK${activity.membership.membership_level.price.toFixed(2)}
                    </p>
                    <Badge 
                      variant={
                        activity.membership.status === 'ACTIVE' 
                          ? 'default' 
                          : activity.membership.status === 'STOPPED'
                          ? 'outline'
                          : activity.membership.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                      } 
                      className="mt-1"
                    >
                      {activity.membership.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activityPagination.totalPages > 1 && (
            <div className="mt-4 pt-4 border-t">
              <Pagination
                currentPage={activityPage}
                totalPages={activityPagination.totalPages}
                onPageChange={setActivityPage}
                totalItems={activityPagination.total}
                itemsPerPage={activityPagination.limit}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

