"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useEventActions } from "@/features/event/hooks/useEventActions";
import { useMembershipLevels } from "@/features/membership/hooks";
import { EventStatus } from "@/generated/prisma";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { QuillEditor } from "@/components/ui/QuillEditor";
import { LocationPicker } from "@/components/ui/LocationPicker";

export default function CreateEventPage() {
  const t = useTranslations('EventsManagement');
  const router = useRouter();
  const { createEvent, loading } = useEventActions(() => router.push('/dashboard/events'));
  const { levels: membershipLevels } = useMembershipLevels();

  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState({
    slug: "",
    image: undefined as File | undefined,
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    is_online: false,
    meeting_url: "",
    latitude: null as number | null,
    longitude: null as number | null,
    is_paid: false,
    capacity: "",
    is_public: true,
    is_highlighted: false,
    status: EventStatus.DRAFT as EventStatus,
    translations: [
      { locale: "en", title: "", short_description: "", description: "", place_name: "", place_details: "" },
      { locale: "zh-HK", title: "", short_description: "", description: "", place_name: "", place_details: "" },
    ],
    prices: [] as Array<{
      membership_level_id: number | null;
      price: string;
      quota: string;
      is_active: boolean;
    }>,
  });

  // Auto-generate price fields when is_paid is toggled
  useEffect(() => {
    if (formData.is_paid && membershipLevels && membershipLevels.length > 0 && formData.prices.length === 0) {
      // Sort membership levels by priority (ascending)
      const sortedLevels = [...membershipLevels].sort((a: any, b: any) => a.priority - b.priority);
      
      const defaultPrices = [
        { membership_level_id: null, price: "0", quota: "", is_active: true },
        ...sortedLevels.map((level: any) => ({
          membership_level_id: level.id,
          price: "0",
          quota: "",
          is_active: true,
        }))
      ];
      setFormData(prev => ({ ...prev, prices: defaultPrices }));
    } else if (!formData.is_paid && formData.prices.length > 0) {
      setFormData(prev => ({ ...prev, prices: [] }));
    }
  }, [formData.is_paid, membershipLevels, formData.prices.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        prices: formData.is_paid ? formData.prices
          .filter(p => p.price && p.price.trim() !== '')
          .map(p => ({
            membership_level_id: p.membership_level_id,
            price: parseFloat(p.price),
            quota: p.quota ? parseInt(p.quota) : undefined,
            is_active: p.is_active,
          })) : [],
      };
      await createEvent(data);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleEnglishTitleChange = (title: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[0] = { ...newTranslations[0], title };
    const slug = generateSlug(title);
    setFormData({ ...formData, translations: newTranslations, slug });
  };

  const handleTranslationChange = (index: number, field: string, value: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setFormData({ ...formData, translations: newTranslations });
  };

  const handleImageChange = (file: File | null) => {
    setFormData({ ...formData, image: file || undefined });
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(undefined);
    }
  };

  const handleLocationChange = (lat: number | null, lng: number | null) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handlePriceChange = (index: number, field: string, value: any) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const getMembershipLevelName = (id: number | null) => {
    if (id === null) return "Public (Non-members)";
    const level = membershipLevels.find((l: any) => l.id === id);
    return level ? level.name : "Unknown";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/events')}
          className="rounded-full border-2 border-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('form.createTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('form.createDescription')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('form.basicInfo')}</h2>
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{t('form.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as EventStatus })}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventStatus.DRAFT}>{t('status.draft')}</SelectItem>
                    <SelectItem value={EventStatus.PUBLISHED}>{t('status.published')}</SelectItem>
                    <SelectItem value={EventStatus.CANCELLED}>{t('status.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">{t('form.capacity')}</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder={t('form.capacityPlaceholder')}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{t('form.imageUrl')}</Label>
                <ImageUploadField 
                  onChange={handleImageChange}
                  previewUrl={imagePreview}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('form.startDate')} *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">{t('form.startTime')}</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_date">{t('form.endDate')} *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">{t('form.endTime')}</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_online">{t('form.isOnline')}</Label>
                    <p className="text-sm text-muted-foreground">{t('form.isOnlineDescription')}</p>
                  </div>
                  <Switch
                    id="is_online"
                    checked={formData.is_online}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
                  />
                </div>

                {formData.is_online && (
                  <div className="space-y-2">
                    <Label htmlFor="meeting_url">{t('form.meetingUrl')}</Label>
                    <Input
                      id="meeting_url"
                      value={formData.meeting_url}
                      onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                      placeholder="https://zoom.us/j/123456789"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_paid">{t('form.isPaid')}</Label>
                    <p className="text-sm text-muted-foreground">{t('form.isPaidDescription')}</p>
                  </div>
                  <Switch
                    id="is_paid"
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_public">{t('form.isPublic')}</Label>
                    <p className="text-sm text-muted-foreground">{t('form.isPublicDescription')}</p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_highlighted">{t('form.isHighlighted')}</Label>
                    <p className="text-sm text-muted-foreground">{t('form.isHighlightedDescription')}</p>
                  </div>
                  <Switch
                    id="is_highlighted"
                    checked={formData.is_highlighted}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          {formData.is_paid && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Pricing</h2>
              <div className="space-y-3">
                {formData.prices && formData.prices.length > 0 ? (
                  formData.prices.map((price, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">
                          {getMembershipLevelName(price.membership_level_id)}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Price (HKD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={price.price}
                            onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Quota</Label>
                          <Input
                            type="number"
                            value={price.quota}
                            onChange={(e) => handlePriceChange(index, 'quota', e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Loading pricing options...</p>
                )}
              </div>
            </div>
          )}

          {/* Location (for offline events) */}
          {!formData.is_online && (
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
              label="Event Location"
            />
          )}
        </div>

        {/* Translations */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">{t('form.translations')}</h2>

          {/* English Translation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🇬🇧 {t('form.englishContent')}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-title">{t('form.title')} *</Label>
              <Input
                id="en-title"
                value={formData.translations[0].title}
                onChange={(e) => handleEnglishTitleChange(e.target.value)}
                placeholder={t('form.titlePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('form.slug')}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="event-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="en-short">{t('form.shortDescription')}</Label>
              <Input
                id="en-short"
                value={formData.translations[0].short_description}
                onChange={(e) => handleTranslationChange(0, 'short_description', e.target.value)}
                placeholder={t('form.shortDescriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="en-description">{t('form.description')}</Label>
              <QuillEditor
                value={formData.translations[0].description}
                onChange={(value) => handleTranslationChange(0, 'description', value)}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            {!formData.is_online && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="en-place">{t('form.placeName')}</Label>
                  <Input
                    id="en-place"
                    value={formData.translations[0].place_name}
                    onChange={(e) => handleTranslationChange(0, 'place_name', e.target.value)}
                    placeholder={t('form.placeNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="en-place-details">{t('form.placeDetails')}</Label>
                  <Input
                    id="en-place-details"
                    value={formData.translations[0].place_details}
                    onChange={(e) => handleTranslationChange(0, 'place_details', e.target.value)}
                    placeholder={t('form.placeDetailsPlaceholder')}
                  />
                </div>
              </>
            )}
          </div>

          {/* Chinese Translation */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🇭🇰 {t('form.chineseContent')}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zh-title">{t('form.title')} *</Label>
              <Input
                id="zh-title"
                value={formData.translations[1].title}
                onChange={(e) => handleTranslationChange(1, 'title', e.target.value)}
                placeholder={t('form.titlePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zh-short">{t('form.shortDescription')}</Label>
              <Input
                id="zh-short"
                value={formData.translations[1].short_description}
                onChange={(e) => handleTranslationChange(1, 'short_description', e.target.value)}
                placeholder={t('form.shortDescriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zh-description">{t('form.description')}</Label>
              <QuillEditor
                value={formData.translations[1].description}
                onChange={(value) => handleTranslationChange(1, 'description', value)}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            {!formData.is_online && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="zh-place">{t('form.placeName')}</Label>
                  <Input
                    id="zh-place"
                    value={formData.translations[1].place_name}
                    onChange={(e) => handleTranslationChange(1, 'place_name', e.target.value)}
                    placeholder={t('form.placeNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zh-place-details">{t('form.placeDetails')}</Label>
                  <Input
                    id="zh-place-details"
                    value={formData.translations[1].place_details}
                    onChange={(e) => handleTranslationChange(1, 'place_details', e.target.value)}
                    placeholder={t('form.placeDetailsPlaceholder')}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 sticky bottom-0 bg-background p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/events')}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('form.creating') : t('form.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
