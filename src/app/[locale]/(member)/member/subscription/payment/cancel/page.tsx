'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const t = useTranslations('Member');
  const router = useRouter();

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">{t('paymentCancelled')}</CardTitle>
          <CardDescription>{t('paymentCancelledDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-6">
            <p className="text-sm text-muted-foreground text-center">
              {t('noChargesMade')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/member/subscription')}
              className="flex-1"
            >
              {t('tryAgain')}
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
