'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export default function PhotoUpload({
  userId, currentUrl, onUploaded, aspectRatio = 'landscape',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(currentUrl ?? '');
  const inputRef                  = useRef<HTMLInputElement>(null);
  const supabase                  = createClient();

  const aspectClass = {
    square:    'aspect-square',
    portrait:  'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  }[aspectRatio];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setUploading(true);
    try {
      const ext      = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('animal-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(fileName);

      setPreview(urlData.publicUrl);
      onUploaded(urlData.publicUrl);
    } catch (err) {
      console.error(err);
      alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview('');
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />

      {preview ? (
        <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-[#F7F7F5] border border-[#E8E8E4]`}>
          <img
            src={preview}
            alt="업로드된 사진"
            className="w-full h-full object-cover object-center"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${aspectClass} rounded-xl border-2 border-dashed border-[#E8E8E4] bg-[#F7F7F5] flex flex-col items-center justify-center hover:border-[#9A9A94] transition-colors disabled:opacity-50`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-[#9A9A94] animate-spin mb-2" />
              <span className="text-sm text-[#9A9A94]">업로드 중...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[#9A9A94] mb-2" />
              <span className="text-sm font-medium text-[#111]">사진 추가하기</span>
              <span className="text-[11px] text-[#C8C8C4] mt-1">JPG · PNG · WEBP · 최대 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
