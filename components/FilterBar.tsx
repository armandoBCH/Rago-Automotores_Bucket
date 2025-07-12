import React from 'react';

interface FilterBarProps {
    filters: {
        make: string;
        year: string;
        price: string;
        vehicleType: string;
    };
    onFilterChange: (filters: FilterBarProps['filters']) => void;
    brands: string[];
    uniqueVehicleTypes: string[];
}

const FilterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
        </label>
        <input {...props} id={props.name} className="w-full px-4 py-2 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition-all duration-200" />
    </div>
);

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, brands, uniqueVehicleTypes }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const cleanedValue = value.replace(/\D/g, ''); // Allow only digits
        onFilterChange({ ...filters, [name]: cleanedValue });
    };

    const resetFilters = () => {
        onFilterChange({ make: '', year: '', price: '', vehicleType: '' });
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md p-5 md:p-6 rounded-xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                    <label htmlFor="make" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Marca
                    </label>
                    <select
                        id="make"
                        name="make"
                        value={filters.make}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        <option value="">Todas</option>
                        {brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Tipo
                    </label>
                    <select
                        id="vehicleType"
                        name="vehicleType"
                        value={filters.vehicleType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        <option value="">Todos</option>
                        {uniqueVehicleTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <FilterInput
                    label="Año (desde)"
                    name="year"
                    type="text"
                    pattern="\d*"
                    inputMode="numeric"
                    placeholder="Ej: 2020"
                    value={filters.year}
                    onChange={handleNumericChange}
                />

                <FilterInput
                    label="Precio (hasta)"
                    name="price"
                    type="text"
                    pattern="\d*"
                    inputMode="numeric"
                    placeholder="Ej: 30000"
                    value={filters.price}
                    onChange={handleNumericChange}
                />
                 <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 text-base font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-slate-500 transition-all duration-200"
                >
                    Limpiar Filtros
                </button>
            </div>
        </div>
    );
};

export default FilterBar;