"use client";

import { useState, useId, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { upload } from '@vercel/blob/client';

interface ImageUploadInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function ImageUploadInput({ value, onChange, placeholder, className, required }: ImageUploadInputProps) {
  const [saving, setSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const id = useId();

  useEffect(() => {
    fetch('/api/admin/upload-token')
      .then(res => res.json())
      .then(data => setHasToken(data.hasToken))
      .catch(() => setHasToken(false));
  }, []);

  return (
    <div className="flex gap-2 w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "https://..."}
        className={className}
        required={required}
      />
      <input
        type="file"
        accept="image/*,video/*,application/pdf"
        className="hidden"
        id={`file-upload-${id}`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setSaving(true);
          try {
            if (hasToken) {
              // Use Vercel Blob Client Upload (supports up to 500MB)
              const newBlob = await upload(`tours/${Date.now()}-${file.name.replace(/\s+/g, '_')}`, file, {
                access: 'public',
                handleUploadUrl: '/api/admin/upload-token',
              });
              onChange(newBlob.url);
            } else {
              // Fallback to standard route for local dev without Blob token
              const formData = new FormData();
              formData.append('file', file);
              const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                body: formData
              });
              if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP Error ${res.status}: ${text.substring(0, 100)}`);
              }
              const data = await res.json();
              if (data.success) {
                onChange(data.url);
              } else {
                alert(`Error: ${data.error}\nDetalles: ${data.details || 'Sin detalles'}\nToken Blob Existe: ${data.hasToken ? 'Sí' : 'No'}`);
              }
            }
          } catch (err: any) {
            console.error(err);
            alert(`Error al subir archivo: ${err.message || 'Error de conexión'}`);
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
