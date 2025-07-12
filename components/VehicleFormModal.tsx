
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Vehicle, VehicleFormData } from '../types';
import { XIcon } from '../constants';
import VehicleCard from './VehicleCard';
import ImageCarousel from './ImageCarousel';
import ImageUploader, { ImageFile } from './ImageUploader';
import { compressImage } from '../utils/image';
import { supabase } from '../lib/supabaseClient';

const DRAFT_STORAGE_KEY = 'rago-new-vehicle-draft';

type FormDataState = Omit<Vehicle, 'id' | 'year' | 'price' | 'mileage' | 'created_at' | 'images' | 'display_order' | 'fuelType' | 'video_url'> & {
    year: string;
    price: string;
    mileage: string;
    fuelType: string;
    customFuelType?: string;
    video_url: string;
};

const getInitialFormState = (): FormDataState => ({
    make: '', model: '', year: '', price: '', mileage: '', engine: '',
    transmission: 'Manual', fuelType: 'Nafta', vehicle_type: '', customFuelType: '', description: '',
    is_featured: false, is_sold: false, video_url: ''
});

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vehicle: VehicleFormData) => void;
    initialData?: Vehicle;
    brands: string[];
    uniqueVehicleTypes: string[];
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, brands, uniqueVehicleTypes }) => {
    const [formData, setFormData] = useState<FormDataState>(getInitialFormState());
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [previewMode, setPreviewMode] = useState<'card' | 'detail'>('card');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState({ total: 0, completed: 0 });
    
    const imageFilesRef = useRef(imageFiles);
    imageFilesRef.current = imageFiles;

    const isOtherFuelType = formData.fuelType === 'Otro';

    const resetState = useCallback(() => {
        setFormData(getInitialFormState());
        setImageFiles([]);
        setPreviewMode('card');
        setIsSubmitting(false);
        setSubmitProgress({ total: 0, completed: 0 });
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
            if (initialData) { // Editing existing vehicle
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                const standardFuelTypes = ['Nafta', 'Diesel', 'GNC'];
                const isStandard = standardFuelTypes.includes(initialData.fuelType);
                const { created_at, id, images, display_order, ...rest } = initialData;
                setFormData({
                    ...rest,
                    year: String(initialData.year),
                    price: String(initialData.price),
                    mileage: String(initialData.mileage),
                    vehicle_type: initialData.vehicle_type || '',
                    fuelType: isStandard ? initialData.fuelType : 'Otro',
                    customFuelType: isStandard ? '' : initialData.fuelType,
                    video_url: initialData.video_url || ''
                });
                setImageFiles(images.map(url => ({ id: url, file: null, preview: url, url, status: 'complete' })));
            } else { // Adding a new vehicle
                const savedDraftJSON = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraftJSON) {
                    try {
                        const savedDraft = JSON.parse(savedDraftJSON);
                        setFormData(savedDraft);
                        setImageFiles([]); 
                        console.log("Borrador de vehículo cargado desde la sesión anterior.");
                    } catch {
                        setFormData(getInitialFormState());
                    }
                } else {
                    const emptyState = getInitialFormState();
                    emptyState.year = String(new Date().getFullYear());
                    setFormData(emptyState);
                }
            }
        } else {
            resetState();
        }
    }, [initialData, isOpen, resetState]);

    // Save draft for new vehicles
    useEffect(() => {
        if (isOpen && !initialData) {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData, isOpen, initialData]);

    const previewVehicle: Vehicle = useMemo(() => {
        const validImages = imageFiles.map(f => f.preview).filter(Boolean);
        return {
            id: initialData?.id || 0,
            created_at: initialData?.created_at || new Date().toISOString(),
            make: formData.make || 'Marca',
            model: formData.model || 'Modelo',
            year: parseInt(formData.year) || new Date().getFullYear(),
            price: parseInt(formData.price) || 0,
            mileage: parseInt(formData.mileage) || 0,
            engine: formData.engine || 'Motor',
            transmission: formData.transmission,
            fuelType: isOtherFuelType ? formData.customFuelType || 'Combustible' : formData.fuelType,
            vehicle_type: formData.vehicle_type || 'Tipo',
            description: formData.description || 'Descripción del vehículo.',
            images: validImages.length > 0 ? validImages : ['https://i.imgur.com/g2a4A0a.png'],
            is_featured: formData.is_featured,
            is_sold: formData.is_sold,
            display_order: initialData?.display_order ?? 0,
            video_url: formData.video_url || null,
        };
    }, [formData, imageFiles, initialData, isOtherFuelType]);

    const handleClose = () => {
        if (isSubmitting) return;
        setIsAnimatingOut(true);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['year', 'price', 'mileage'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            // If marking as sold, unmark as featured
            if (name === 'is_sold' && checked) {
                newState.is_featured = false;
            }
            // If unmarking as sold, don't automatically re-feature
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const newFilesToUpload = imageFiles.filter(f => f.file && f.status !== 'complete');
        if (imageFiles.length === 0) {
            alert("Por favor, añade al menos una imagen.");
            setIsSubmitting(false);
            return;
        }

        setSubmitProgress({ total: newFilesToUpload.length, completed: 0 });

        const uploadPromises = newFilesToUpload.map(async (imageFile) => {
            if (!imageFile.file) return null;
            try {
                const compressedFile = await compressImage(imageFile.file);
                
                const signedUrlResponse = await fetch('/api/create-signed-upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: compressedFile.name, fileType: compressedFile.type }),
                });

                if (!signedUrlResponse.ok) throw new Error('Failed to get signed URL info.');
                const { token, path } = await signedUrlResponse.json();

                const { error: uploadError } = await supabase.storage.from('vehicle-images').uploadToSignedUrl(path, token, compressedFile);
                if (uploadError) throw uploadError;
                
                setSubmitProgress(prev => ({ ...prev, completed: prev.completed + 1 }));

                const { data: { publicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(path);
                return publicUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                // Optionally mark the file as failed in the UI
                return null;
            }
        });

        const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => !!url);
        
        const existingUrls = imageFiles.filter(f => f.url && !f.file).map(f => f.url);
        const finalImageUrls = [...existingUrls, ...uploadedUrls];

        const fuelType = isOtherFuelType ? formData.customFuelType?.trim() : formData.fuelType;
        if (isOtherFuelType && !fuelType) {
            alert("Por favor, especifique el tipo de combustible.");
            setIsSubmitting(false);
            return;
        }

        const vehicleToSubmit: VehicleFormData = {
            ...(initialData?.id && { id: initialData.id }),
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year) || 0,
            price: parseInt(formData.price) || 0,
            mileage: parseInt(formData.mileage) || 0,
            engine: formData.engine,
            transmission: formData.transmission,
            fuelType: fuelType || 'Nafta',
            vehicle_type: formData.vehicle_type || 'N/A',
            description: formData.description,
            images: finalImageUrls,
            is_featured: formData.is_featured,
            is_sold: formData.is_sold,
            video_url: formData.video_url || null,
        };

        onSubmit(vehicleToSubmit);
        // Clear draft after successful submit
        if (!initialData) {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        handleClose();
    };

    if (!isOpen) return null;

    const modalClasses = `fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimatingOut ? 'bg-opacity-0' : 'bg-opacity-75'}`;
    const contentClasses = `bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    
    return (
        <div className={modalClasses} onClick={handleClose}>
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{initialData ? 'Editar Vehículo' : 'Añadir Vehículo'}</h3>
                    <button onClick={handleClose} disabled={isSubmitting} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><XIcon className="h-7 w-7" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                        <form id="vehicle-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><label htmlFor="make" className="block text-base font-medium text-gray-700 dark:text-gray-300">Marca</label><input id="make" name="make" list="brands-datalist" value={formData.make} onChange={handleChange} required className="mt-1 form-input" /><datalist id="brands-datalist">{brands.map(brand => <option key={brand} value={brand} />)}</datalist></div>
                                <InputField label="Modelo" name="model" value={formData.model} onChange={handleChange} required />
                                <InputField label="Tipo de Vehículo" name="vehicle_type" list="vehicle-types-datalist" value={formData.vehicle_type} onChange={handleChange} required /><datalist id="vehicle-types-datalist">{uniqueVehicleTypes.map(type => <option key={type} value={type} />)}</datalist>
                                <InputField label="Año" name="year" type="text" inputMode="numeric" value={formData.year} onChange={handleChange} required />
                                <InputField label="Precio (ARS)" name="price" type="text" inputMode="numeric" value={formData.price} onChange={handleChange} required />
                                <InputField label="Kilometraje (km)" name="mileage" type="text" inputMode="numeric" value={formData.mileage} onChange={handleChange} required />
                                <InputField label="Motor" name="engine" value={formData.engine} onChange={handleChange} required />
                                <div><label htmlFor="transmission" className="block text-base font-medium text-gray-700 dark:text-gray-300">Transmisión</label><select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} className="mt-1 form-input"><option>Manual</option><option>Automática</option></select></div>
                                 <div><label htmlFor="fuelType" className="block text-base font-medium text-gray-700 dark:text-gray-300">Tipo de Combustible</label><select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} className="mt-1 form-input"><option>Nafta</option><option>Diesel</option><option>GNC</option><option value="Otro">Otro</option></select></div>
                                {isOtherFuelType && <div><label htmlFor="customFuelType" className="block text-base font-medium text-gray-700 dark:text-gray-300">Especificar Combustible</label><input id="customFuelType" name="customFuelType" type="text" value={formData.customFuelType || ''} onChange={handleChange} required={isOtherFuelType} className="mt-1 form-input" placeholder="Ej: Eléctrico"/></div>}
                            </div>
                            <div>
                                <InputField label="URL de Video (Opcional)" name="video_url" type="url" value={formData.video_url || ''} onChange={handleChange} placeholder="https://youtube.com/shorts/..." />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pega aquí la URL de un YouTube Short o Instagram Reel.</p>
                            </div>
                            <div className="col-span-full flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <input id="is_featured" name="is_featured" type="checkbox" checked={formData.is_featured} onChange={handleCheckboxChange} disabled={formData.is_sold} className="h-5 w-5 rounded border-gray-300 text-rago-burgundy focus:ring-rago-burgundy-darker dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" />
                                    <label htmlFor="is_featured" className={`block text-base font-medium text-gray-700 dark:text-gray-300 ${formData.is_sold ? 'opacity-50' : ''}`}>Marcar como destacado</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input id="is_sold" name="is_sold" type="checkbox" checked={formData.is_sold} onChange={handleCheckboxChange} className="h-5 w-5 rounded border-gray-300 text-rago-burgundy focus:ring-rago-burgundy-darker dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="is_sold" className="block text-base font-medium text-gray-700 dark:text-gray-300">Marcar como vendido</label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 form-input"></textarea>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Imágenes</label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Arrastra tus imágenes aquí o haz clic para seleccionarlas. La primera será la portada.</p>
                                <ImageUploader files={imageFiles} setFiles={setImageFiles} disabled={isSubmitting} />
                            </div>
                        </form>
                        
                        <div className="hidden lg:block sticky top-0 h-fit p-6">
                            <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Previsualización</h4>
                            <div className="mb-4 flex justify-center rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
                                <button onClick={() => setPreviewMode('card')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${previewMode === 'card' ? 'bg-white dark:bg-gray-900 text-rago-burgundy shadow' : 'text-gray-600 dark:text-gray-400'}`}>Vista Tarjeta</button>
                                <button onClick={() => setPreviewMode('detail')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${previewMode === 'detail' ? 'bg-white dark:bg-gray-900 text-rago-burgundy shadow' : 'text-gray-600 dark:text-gray-400'}`}>Vista Detalle</button>
                            </div>
                            {previewMode === 'card' ? <VehicleCard vehicle={previewVehicle} onPlayVideo={() => {}} /> : <VehicleDetailPreview vehicle={previewVehicle} />}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                    <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50">Cancelar</button>
                    <button type="submit" form="vehicle-form" disabled={isSubmitting} className="px-4 py-2 text-base font-medium text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:bg-rago-burgundy/70 flex items-center gap-2">
                        {isSubmitting && <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>}
                        {isSubmitting ? `Subiendo ${submitProgress.completed}/${submitProgress.total}...` : 'Guardar'}
                    </button>
                </div>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div><label htmlFor={props.name} className="block text-base font-medium text-gray-700 dark:text-gray-300">{label}</label><input id={props.name} {...props} className="mt-1 form-input" /></div>
);

const VehicleDetailPreview: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
    <div className="border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-inner">
        <div className="max-h-[calc(90vh - 160px)] overflow-y-auto preview-scrollbar">
            <div className="relative aspect-[4/3] bg-gray-200 dark:bg-black overflow-hidden">
                <ImageCarousel images={vehicle.images} videoUrl={vehicle.video_url} onPlayVideo={() => alert("La previsualización del video se activa en la vista real.")} />
                {vehicle.is_sold && (
                    <div className="absolute top-0 left-0 w-64 h-64 overflow-hidden z-20 pointer-events-none">
                        <div
                            className="absolute transform -rotate-45 bg-gradient-to-br from-red-600 to-red-800 text-center text-white font-black uppercase tracking-widest shadow-2xl"
                            style={{
                                width: '350px',
                                left: '-80px',
                                top: '80px',
                                padding: '12px 0',
                                fontSize: '2rem',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                            }}
                        >
                            Vendido
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-6">
                <div className="bg-white dark:bg-gray-900/50 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b dark:border-gray-700 pb-3 mb-3"><h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{vehicle.make} {vehicle.model}</h1><span className="text-lg font-bold inline-block align-baseline py-1 px-3 rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:text-white dark:bg-rago-burgundy">{vehicle.year}</span></div>
                    <div className="my-3 text-center"><p className="text-4xl font-extrabold text-rago-burgundy break-words">${vehicle.price.toLocaleString('es-AR')}</p></div>
                    <div className="mt-3 w-full text-center block bg-rago-burgundy text-white font-bold py-3 px-4 rounded-lg text-lg opacity-70 cursor-not-allowed">Contactar por WhatsApp</div>
                </div>
            </div>
        </div>
        <style>{`.preview-scrollbar::-webkit-scrollbar{width:8px}.preview-scrollbar::-webkit-scrollbar-track{background:0 0}.dark .preview-scrollbar::-webkit-scrollbar-track{background:0 0}.preview-scrollbar::-webkit-scrollbar-thumb{background-color:#6c1e27;border-radius:4px;border:2px solid transparent;background-clip:padding-box}.preview-scrollbar::-webkit-scrollbar-thumb:hover{background-color:#50161d}`}</style>
    </div>
);

export default VehicleFormModal;