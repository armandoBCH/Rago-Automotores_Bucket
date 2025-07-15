
import React, { useState, useMemo } from 'react';
import { FinancingConfig } from '../types';
import { CalculatorIcon } from '../constants';

interface FinancingCalculatorProps {
    config: FinancingConfig;
    vehiclePrice: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ config, vehiclePrice }) => {
    const { maxAmount, maxTerm, interestRate } = config;
    const initialAmount = Math.min(vehiclePrice / 2, maxAmount);

    const [amount, setAmount] = useState(initialAmount);
    const [term, setTerm] = useState(Math.min(12, maxTerm));

    const monthlyPayment = useMemo(() => {
        if (amount <= 0 || term <= 0 || interestRate < 0) return 0;

        const monthlyRate = interestRate / 100;
        if (monthlyRate === 0) return amount / term;

        const numerator = amount * monthlyRate * Math.pow(1 + monthlyRate, term);
        const denominator = Math.pow(1 + monthlyRate, term) - 1;
        
        if (denominator === 0) return 0;
        return numerator / denominator;
    }, [amount, term, interestRate]);
    
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    return (
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <CalculatorIcon className="h-7 w-7 text-rago-burgundy" />
                    Calculadora de Financiación
                </h3>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-base font-medium text-slate-700 dark:text-slate-300">Monto a financiar: <span className="font-bold text-rago-burgundy">{formatCurrency(amount)}</span></label>
                    <input
                        id="amount"
                        type="range"
                        min="100000"
                        max={maxAmount}
                        step="50000"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2"
                    />
                </div>

                <div>
                    <label htmlFor="term" className="block text-base font-medium text-slate-700 dark:text-slate-300">Plazo: <span className="font-bold text-rago-burgundy">{term} meses</span></label>
                    <input
                        id="term"
                        type="range"
                        min="1"
                        max={maxTerm}
                        step="1"
                        value={term}
                        onChange={(e) => setTerm(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2"
                    />
                </div>

                <div className="p-5 bg-slate-100 dark:bg-slate-800/50 rounded-xl space-y-4 text-center">
                    <p className="text-lg text-slate-600 dark:text-slate-400">Cuota mensual estimada</p>
                    <p className="text-4xl font-extrabold text-rago-burgundy">{formatCurrency(monthlyPayment)}</p>
                    <div className="text-sm text-slate-500 dark:text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-700">
                        Total a pagar: {formatCurrency(totalPayment)} | Intereses: {formatCurrency(totalInterest)}<br/>
                        <em className="mt-1 block">Tasa de interés mensual de referencia: {interestRate}%.</em>
                    </div>
                </div>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Este es un cálculo estimado y no constituye una oferta de crédito. Las condiciones finales pueden variar.
                </p>
            </div>
        </section>
    );
};

export default FinancingCalculator;
