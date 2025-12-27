'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'Member', label: 'Member' },
  { value: 'Content Creator', label: 'Content Creator' },
  { value: 'Moderator', label: 'Moderator' },
  { value: 'Administrator', label: 'Administrator' },
];

const MEMBERSHIP_LEVELS = [
  { value: 'free', label: 'Free' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
];

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const t = useTranslations('UsersManagement.addUser');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    membershipLevel: 'free',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success(t('success'), {
        style: {
          background: '#E4097D',
          color: '#fff',
        },
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'Member',
        membershipLevel: 'free',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(
        error instanceof Error ? error.message : t('error'),
        {
          style: {
            background: '#EE3B29',
            color: '#fff',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="membership">{t('membershipLevel')}</Label>
              <Select
                value={formData.membershipLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, membershipLevel: value })
                }
              >
                <SelectTrigger id="membership" className="w-full">
                  <SelectValue placeholder={t('selectMembership')} />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {MEMBERSHIP_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">{t('defaultPassword.title')}</p>
              <p className="text-muted-foreground mt-1">
                {t('defaultPassword.description')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
