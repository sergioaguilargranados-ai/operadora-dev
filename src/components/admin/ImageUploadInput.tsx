"use client";

import { useState, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageUploadInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploadInput({ value, onChange, placeholder, className }: ImageUploadInputProps) {
  const [saving, setSaving] = useState(false);
  const id = useId();

  return (
    <div className="flex gap-2 w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "https://..."}
        className={className}
      />
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        id={`file-upload-${id}`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setSaving(true);
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload-image', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (data.success) {
              onChange(data.url);
            } else {
              alert(`Error: ${data.error}`);
            }
          } catch (err) {
            alert('Error de conexión al subir archivo');
          }
          setSaving(false);
        }}
      />
      <Button 
        type="button"
        variant="outline" 
        disabled={saving}
        className="px-3"
        onClick={() => {
          document.getElementById(`file-upload-${id}`)?.click();
        }}
      >
        {saving ? "..." : "Subir"}
      </Button>
    </div>
  );
}
