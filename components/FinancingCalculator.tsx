
import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorIcon } from '../constants';
import { FinancingSettings } from '../types';

interface FinancingCalculatorProps {
    vehiclePrice: number;
    settings: FinancingSettings | null;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ vehiclePrice, settings }) => {
    const [amount, setAmount] = useState(0);
    const [installments, setInstallments] = useState(3);
    
    useEffect(() => {
        if (settings) {
            const initialAmount = Math.min(vehiclePrice / 2, settings.max_amount);
            setAmount(initialAmount);
        }
    }, [vehiclePrice, settings]);
    
    const monthlyPayment = useMemo(() => {
        if (!settings || amount === 0 || installments === 0) return 0;
        const totalWithInterest = amount * (1 + settings.interest_rate * installments);
        return totalWithInterest / installments;
    }, [amount, installments, settings]);

    if (!settings) {
        return null; // Don't render if settings are not available
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setAmount(Math.min(value, settings.max_amount));
    };

    const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInstallments(parseInt(e.target.value, 10));
    };

    return (
        <section>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-3">
                    <CalculatorIcon className="h-7 w-7 text-rago-burgundy" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Calculadora de Financiación</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <label htmlFor="amount" className="font-semibold text-gray-700 dark:text-gray-300">Monto a financiar</label>
                            <span className="text-lg font-bold text-rago-burgundy">{formatCurrency(amount)}</span>
                        </div>
                        <input
                            type="range"
                            id="amount"
                            min="0"
                            max={settings.max_amount}
                            step="50000"
                            value={amount}
                            onChange={handleAmountChange}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rago-burgundy"
                        />
                         <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>$0</span>
                            <span>{formatCurrency(settings.max_amount)}</span>
                        </div>
                    </div>

                    <div>
                         <div className="flex justify-between items-baseline mb-2">
                            <label htmlFor="installments" className="font-semibold text-gray-700 dark:text-gray-300">Cuotas</label>
                            <span className="text-lg font-bold text-rago-burgundy">{installments}</span>
                        </div>
                        <input
                            type="range"
                            id="installments"
                            min="1"
                            max={settings.max_installments}
                            step="1"
                            value={installments}
                            onChange={handleInstallmentsChange}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rago-burgundy"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>1</span>
                            <span>{settings.max_installments}</span>
                        </div>
                    </div>

                    <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cuota mensual estimada</p>
                        <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-1">
                           {formatCurrency(monthlyPayment)}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            *Tasa de interés fija del {settings.interest_rate * 100}%. Este cálculo es aproximado y no constituye una oferta formal.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinancingCalculator;
