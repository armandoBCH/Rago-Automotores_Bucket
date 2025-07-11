
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { TrashIcon, GripVerticalIcon, PlusIcon } from '../constants';

export type ImageFile = {
    id: string;
    file: File | null;
    preview: string;
    url?: string;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    error?: string;
};

interface ImageUploaderProps {
    files: ImageFile[];
    setFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    disabled?: boolean;
}

const baseStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: '0.5rem',
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#6b7281',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    minHeight: '120px',
    cursor: 'pointer'
};

const focusedStyle: React.CSSProperties = { borderColor: '#6C1E27' };
const acceptStyle: React.CSSProperties = { borderColor: '#16a34a' };
const rejectStyle: React.CSSProperties = { borderColor: '#dc2626' };
const disabledStyle: React.CSSProperties = { opacity: 0.5, cursor: 'not-allowed' };

const darkBaseStyle: React.CSSProperties = {
    ...baseStyle,
    borderColor: '#4b5563',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, setFiles, disabled }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const dragItemNode = useRef<HTMLDivElement | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const newImageFile: ImageFile = {
                    id: `${file.name}-${file.lastModified}-${Math.random()}`,
                    file,
                    preview: dataUrl,
                    status: 'pending'
                };
                setFiles(prev => [...prev, newImageFile]);
            };
            reader.readAsDataURL(file);
        });
    }, [setFiles]);

    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        disabled
    });

    const style = useMemo(() => {
        const isDark = document.documentElement.classList.contains('dark');
        const currentBaseStyle = isDark ? darkBaseStyle : baseStyle;
        return {
            ...currentBaseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
            ...(disabled ? disabledStyle : {}),
        };
    }, [isFocused, isDragAccept, isDragReject, disabled]);

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItemNode.current = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            setDraggedIndex(index);
        }, 0);
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (draggedIndex === null || index === draggedIndex || !dragItemNode.current) return;
        
        const newFiles = [...files];
        const draggedItem = newFiles.splice(draggedIndex, 1)[0];
        newFiles.splice(index, 0, draggedItem);
        setDraggedIndex(index);
        setFiles(newFiles);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        dragItemNode.current = null;
    };
    
    return (
        <div className="space-y-4">
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <PlusIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p>Arrastra imágenes o haz clic para seleccionar</p>
                <em className="text-sm">(Imágenes .jpeg, .png, .webp)</em>
            </div>
            
            <div className="space-y-3">
                {files.map((imageFile, index) => (
                    <div 
                        key={imageFile.id}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`group relative flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700/50 transition-all duration-300 ease-in-out ${draggedIndex === index ? 'opacity-50 shadow-2xl scale-105' : 'opacity-100 shadow-sm'}`}
                    >
                        <div className={`flex-shrink-0 ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`} aria-label="Arrastrar para reordenar">
                           <GripVerticalIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="relative w-20 h-16 rounded flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                             {index === 0 && <span className="absolute -top-1.5 -left-1.5 bg-rago-burgundy text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 select-none">Principal</span>}
                            <img 
                                src={imageFile.preview} 
                                alt={`Previsualización de ${imageFile.file?.name || 'imagen'}`} 
                                className="w-full h-full object-cover rounded" 
                            />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{imageFile.file?.name || new URL(imageFile.url || '').pathname.split('/').pop()}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{imageFile.file ? `${(imageFile.file.size / 1024).toFixed(1)} KB` : 'Subida'}</p>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                            <button type="button" onClick={() => removeFile(imageFile.id)} disabled={disabled} className="p-1.5 disabled:opacity-50 text-red-500 hover:text-red-700 transition-colors"><TrashIcon /></button>
                        </div>

                        {/* Hover Preview Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 bg-white dark:bg-black border border-slate-300 dark:border-slate-600 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <img src={imageFile.preview} alt="Vista previa ampliada" className="w-56 h-auto max-h-56 object-contain rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUploader;
