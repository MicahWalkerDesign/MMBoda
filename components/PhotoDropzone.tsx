'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface PhotoDropzoneProps {
    onUpload: (files: FileWithPreview[]) => void;
    isUploading: boolean;
}

export interface FileWithPreview {
    file: File;
    preview: string;
    base64: string;
}

export default function PhotoDropzone({ onUpload, isUploading }: PhotoDropzoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));

        const processed: FileWithPreview[] = await Promise.all(
            fileArray.map(
                (file) =>
                    new Promise<FileWithPreview>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            resolve({
                                file,
                                preview: URL.createObjectURL(file),
                                base64: reader.result as string,
                            });
                        };
                        reader.readAsDataURL(file);
                    })
            )
        );

        setSelectedFiles((prev) => [...prev, ...processed]);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
            }
        },
        [processFiles]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSubmit = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 
          text-center transition-all duration-300
          ${dragActive
                        ? 'border-terracotta bg-terracotta/5 scale-[1.01]'
                        : 'border-terracotta/30 hover:border-terracotta/60 hover:bg-terracotta/5'
                    }
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Camera icon */}
                <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-terracotta/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                </div>

                <p className="text-sm font-medium text-coffee/80 font-[family-name:var(--font-poppins)]">
                    Tap to choose photos
                </p>
                <p className="text-xs text-coffee/50 mt-1">
                    or drag & drop your images here
                </p>
            </div>

            {/* Preview grid */}
            {selectedFiles.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2">
                        {selectedFiles.map((f, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                <Image
                                    src={f.preview}
                                    alt={`Preview ${i + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-coffee/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className={`
              w-full py-3.5 rounded-xl font-semibold text-sm text-white
              font-[family-name:var(--font-poppins)]
              transition-all duration-300
              ${isUploading
                                ? 'bg-terracotta/50 cursor-wait'
                                : 'bg-fuchsia hover:bg-fuchsia-dark active:scale-[0.98] shadow-lg shadow-fuchsia/25'
                            }
            `}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
