'use client';

import { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import PhotoDropzone, { FileWithPreview } from '../../components/PhotoDropzone';
import { useI18n } from '../../lib/i18n';
import { uploadPhotos } from '../../lib/uploadPhoto';

// Replace with your deployed Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytpRJvfdeZHWyE9M7ijlMnhFc-ljWb_NsDkN4xzhr93wnn3yv-YJMkcyMhbOit-JCn/exec';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
    const { t } = useI18n();
    const [guestName, setGuestName] = useState('');
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [uploadCount, setUploadCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');

    const handleUpload = async (files: FileWithPreview[]) => {
        setStatus('uploading');
        setProgress(0);
        setProgressLabel(`0/${files.length}`);

        const items = files.map(({ base64, bytes, mime, file }) => {
            const baseName = file.name.replace(/\.(heic|heif|png|webp|tiff?|bmp|gif)$/i, '');
            const filename = mime === 'image/jpeg' && !/\.jpe?g$/i.test(baseName)
                ? `${baseName}.jpg`
                : file.name;
            return {
                base64,
                bytes,
                filename: guestName ? `${guestName}_${filename}` : `guest_${filename}`,
                filetype: mime,
            };
        });

        const { successCount } = await uploadPhotos(SCRIPT_URL, items, {
            concurrency: 3,
            onProgress: (p) => {
                setProgress(p.fraction);
                setProgressLabel(`${p.completedFiles}/${p.totalFiles}`);
            },
        });

        if (successCount > 0) {
            setUploadCount((prev) => prev + successCount);
            setStatus('success');
        } else {
            setStatus('error');
        }
        setTimeout(() => {
            setStatus('idle');
            setProgress(0);
            setProgressLabel('');
        }, 4000);
    };

    const uploadedText =
        uploadCount === 1
            ? t('upload.counted', { n: uploadCount })
            : t('upload.countedPlural', { n: uploadCount });

    return (
        <div className="min-h-dvh px-4 py-8 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in-up opacity-0">
                <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-terracotta">
                    {t('upload.title')}
                </h1>
                <p className="text-sm text-coffee/60 leading-relaxed">
                    {t('upload.subtitleStandalone')}
                </p>
            </div>

            <GlassCard delay={0.1}>
                <label className="block text-xs font-medium text-coffee/70 mb-2 font-[family-name:var(--font-poppins)]">
                    {t('upload.nameLabel')} <span className="text-coffee/40">{t('upload.optional')}</span>
                </label>
                <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('upload.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/40
            text-sm text-coffee placeholder:text-coffee/30
            focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/40
            transition-all"
                />
            </GlassCard>

            <GlassCard delay={0.2}>
                <PhotoDropzone
                    onUpload={handleUpload}
                    isUploading={status === 'uploading'}
                    progress={progress}
                    progressLabel={progressLabel}
                />
            </GlassCard>

            {status === 'success' && (
                <div className="glass rounded-2xl p-4 text-center animate-fade-in-up border-sage/30 border">
                    <div className="text-2xl mb-1">🎉</div>
                    <p className="text-sm font-semibold text-sage-dark font-[family-name:var(--font-poppins)]">
                        {t('upload.success')}
                    </p>
                    <p className="text-xs text-coffee/50 mt-0.5">{t('upload.successDesc')}</p>
                </div>
            )}

            {status === 'error' && (
                <div className="glass rounded-2xl p-4 text-center animate-fade-in-up border-fuchsia/30 border">
                    <div className="text-2xl mb-1">😕</div>
                    <p className="text-sm font-semibold text-fuchsia-dark font-[family-name:var(--font-poppins)]">
                        {t('upload.error')}
                    </p>
                    <p className="text-xs text-coffee/50 mt-0.5">{t('upload.errorDesc')}</p>
                </div>
            )}

            {uploadCount > 0 && (
                <div className="text-center animate-fade-in">
                    <p className="text-xs text-coffee/40">
                        {uploadedText.split(String(uploadCount))[0]}
                        <span className="font-semibold text-terracotta">{uploadCount}</span>
                        {uploadedText.split(String(uploadCount))[1]} 📸
                    </p>
                </div>
            )}

            <GlassCard delay={0.3} className="!p-4">
                <div className="flex gap-3 items-start">
                    <span className="text-lg">💡</span>
                    <div>
                        <p className="text-xs font-medium text-coffee/70 font-[family-name:var(--font-poppins)]">
                            {t('upload.tipsTitle')}
                        </p>
                        <ul className="text-xs text-coffee/50 mt-1 space-y-0.5">
                            <li>• {t('upload.tip1')}</li>
                            <li>• {t('upload.tip2')}</li>
                            <li>• {t('upload.tip3')}</li>
                        </ul>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
