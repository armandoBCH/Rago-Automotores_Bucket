
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, CalculatorIcon } from '../constants';
import { FinancingSettings } from '../types';

interface FinancingCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehiclePrice: number;
    settings: FinancingSettings;
}

const FinancingCalculatorModal: React.FC<FinancingCalculatorModalProps> = ({ isOpen, onClose, vehiclePrice, settings }) => {
    const maxFinancing = Math.min(vehiclePrice, settings.maxAmount);
    const [amount, setAmount] = useState(Math.min(500000, maxFinancing));
    const [term, setTerm] = useState(Math.min(12, settings.maxTerm));
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
        if (value > maxFinancing) value = maxFinancing;
        setAmount(value);
    };

    const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 1;
        if (value > settings.maxTerm) value = settings.maxTerm;
        setTerm(value);
    };

    const monthlyPayment = useMemo(() => {
        if (!amount || !term) return 0;
        const monthlyInterestRate = (settings.interestRate / 100);
        // Simple interest calculation for illustrative purposes
        const totalInterest = amount * monthlyInterestRate * (term / 12);
        const totalRepayment = amount + totalInterest;
        return totalRepayment / term;
    }, [amount, term, settings.interestRate]);

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen) return null;

    const modalClasses = `fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimatingOut ? 'bg-opacity-0' : 'bg-opacity-60'}`;
    const contentClasses = `bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    
    return createPortal(
        <div className={modalClasses} onClick={handleClose}>
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <CalculatorIcon className="h-8 w-8 text-rago-burgundy" />
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">Calculadora de Financiación</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><XIcon className="h-7 w-7" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-base font-medium text-slate-700 dark:text-slate-300">Monto a financiar (ARS)</label>
                        <input type="text" id="amount" value={amount.toLocaleString('es-AR')} onChange={handleAmountChange} className="mt-1 form-input" />
                        <input type="range" min="0" max={maxFinancing} value={amount} onChange={handleAmountChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Máximo: ${maxFinancing.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                        <label htmlFor="term" className="block text-base font-medium text-slate-700 dark:text-slate-300">Plazo (meses)</label>
                        <input type="text" id="term" value={term} onChange={handleTermChange} className="mt-1 form-input" />
                         <input type="range" min="1" max={settings.maxTerm} value={term} onChange={handleTermChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Máximo: {settings.maxTerm} meses</p>
                    </div>
                    <div className="text-center bg-rago-burgundy/10 dark:bg-rago-burgundy/20 p-6 rounded-lg">
                        <p className="text-lg text-rago-burgundy dark:text-rago-burgundy/80 font-semibold">Cuota mensual aproximada:</p>
                        <p className="text-4xl lg:text-5xl font-extrabold text-rago-burgundy dark:text-rago-burgundy/90 mt-1">${monthlyPayment.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Tasa de interés de referencia: {settings.interestRate}% anual (simple).</p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Este es un cálculo de referencia y no constituye una oferta final. Los valores pueden variar.</p>
                </div>
            </div>
            <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default FinancingCalculatorModal;
