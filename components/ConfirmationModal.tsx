
import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isConfirming?: boolean;
    children?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, isConfirming, children }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (isConfirming) return;
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleConfirm = () => {
        if (isConfirming) return;
        onConfirm();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className={`fixed inset-0 bg-black bg-opacity-0 flex justify-center items-center z-50 p-4 transition-opacity duration-200 ease-out ${!isAnimatingOut && 'bg-opacity-60'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h3 id="confirmation-title" className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{message}</p>
                    {children}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isConfirming}
                        className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        className="px-4 py-2 text-base font-medium text-white bg-rago-burgundy rounded-md hover:bg-rago-burgundy-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rago-burgundy/50 disabled:bg-rago-burgundy/70 disabled:cursor-wait flex items-center gap-2"
                    >
                        {isConfirming && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isConfirming ? 'Confirmando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;