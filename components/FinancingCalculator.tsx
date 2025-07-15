import React, { useState, useMemo } from 'react';
import { FinancingConfig } from '../types';

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

    const { monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
        if (amount <= 0 || term <= 0 || interestRate < 0) {
            return { monthlyPayment: 0, totalPayment: amount, totalInterest: 0 };
        }

        // Simple/flat interest calculation as requested
        // Total Interest = (Amount * (Interest Rate / 100)) * Term
        // Total Payment = Amount + Total Interest
        // Monthly Payment = Total Payment / Term
        
        const monthlyInterestAmount = amount * (interestRate / 100);
        const calculatedTotalInterest = monthlyInterestAmount * term;
        const calculatedTotalPayment = amount + calculatedTotalInterest;
        const calculatedMonthlyPayment = term > 0 ? calculatedTotalPayment / term : 0;

        return {
            monthlyPayment: calculatedMonthlyPayment,
            totalPayment: calculatedTotalPayment,
            totalInterest: calculatedTotalInterest,
        };
    }, [amount, term, interestRate]);

    return (
        <div className="space-y-6">
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2 accent-rago-burgundy"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2 accent-rago-burgundy"
                />
            </div>

            <div className="p-5 bg-slate-100 dark:bg-slate-800/50 rounded-xl space-y-4 text-center">
                <p className="text-lg text-slate-600 dark:text-slate-400">Cuota mensual estimada</p>
                <p className="text-4xl font-extrabold text-rago-burgundy">{formatCurrency(monthlyPayment)}</p>
                <div className="text-sm text-slate-500 dark:text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-700">
                    Total a pagar: {formatCurrency(totalPayment)} | Intereses: {formatCurrency(totalInterest)}<br/>
                    <em className="mt-1 block">Tasa de interés mensual (simple) de referencia: {interestRate}%.</em>
                </div>
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Este es un cálculo estimado y no constituye una oferta de crédito. Las condiciones finales pueden variar.
            </p>
            <style>{`.accent-rago-burgundy { accent-color: #6C1E27; }`}</style>
        </div>
    );
};

export default FinancingCalculator;