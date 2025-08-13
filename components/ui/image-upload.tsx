import React from 'react';
import { Input } from './input';
import { Label } from './label';

interface ImageUploadProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, file: File | null) => void;
  className?: string;
}

export function ImageUpload({
  id,
  label,
  value,
  onChange,
  className = '',
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl, file);
    }
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="grid gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value, null)}
          placeholder="Image URL or upload a file"
        />
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {value && (
          <div className="mt-2">
            <img
              src={value}
              alt={label}
              className="max-w-[200px] rounded-md shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
