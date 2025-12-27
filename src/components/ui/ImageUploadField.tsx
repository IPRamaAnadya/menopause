import { Input } from './input';
import { Label } from './label';
import React from 'react';

interface ImageUploadFieldProps {
  label?: string;
  name?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  previewUrl?: string;
}

export function ImageUploadField({ label, name, onChange, value, previewUrl }: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        type="file"
        accept="image/*"
        name={name}
        id={name}
        onChange={e => onChange(e.target.files?.[0] || null)}
      />
      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="mt-2 h-32 w-auto rounded-md object-cover border" />
      )}
    </div>
  );
}
