'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const t = useTranslations('Member');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Invalid payment session');
      setVerifying(false);
      return;
    }

    // Verify the payment
    fetch(`/api/member/memberships/verify-payment?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembership(data.data.membership);
        } else {
          setError(data.message || 'Failed to verify payment');
        }
      })
      .catch(err => {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">{t('verifyingPayment')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{t('paymentVerificationFailed')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/member/subscription')}>
              {t('backToSubscription')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">{t('paymentSuccessful')}</CardTitle>
          <CardDescription>{t('membershipUpdatedSuccessfully')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {membership && (
            <div className="bg-muted rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">{t('membershipLevel')}:</span>
                <span>{membership.membership_level.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('startDate')}:</span>
                <span>{new Date(membership.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('endDate')}:</span>
                <span>{new Date(membership.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('status')}:</span>
                <span className="text-green-600 font-medium">{membership.status}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/member/subscription')}
              className="flex-1"
            >
              {t('viewSubscription')}
            </Button>
            <Button 
              onClick={() => router.push('/member')}
              variant="outline"
              className="flex-1"
            >
              {t('backToDashboard')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
