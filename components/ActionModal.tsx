
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../constants';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, title, icon, children }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, 300); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen && !isAnimatingOut) {
        return null;
    }

    const modalClasses = `fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-all duration-300 ease-out ${isOpen && !isAnimatingOut ? 'bg-opacity-70 backdrop-blur-sm' : 'bg-opacity-0 backdrop-blur-none'}`;
    const contentClasses = `bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${isOpen && !isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;

    return createPortal(
        <div 
            className={modalClasses} 
            onClick={onClose} 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="text-rago-burgundy">{icon}</div>
                        <h3 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default ActionModal;
