import React, { useState } from 'react';

interface DescriptionCardProps {
    description: string;
}

const TRUNCATE_LENGTH = 350; // Number of characters to show before truncating

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const textToShow = description || 'No hay descripción disponible para este vehículo.';
    const isLongText = textToShow.length > TRUNCATE_LENGTH;

    // Determine the text to display based on whether it's expanded or not
    const displayText = isLongText && !isExpanded 
        ? `${textToShow.substring(0, TRUNCATE_LENGTH)}...`
        : textToShow;

    return (
        <section>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800 h-full">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Descripción</h3>
                </div>
                <div className="p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {displayText}
                    </p>
                    {isLongText && !isExpanded && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="mt-4 font-bold text-rago-burgundy hover:underline focus:outline-none"
                            aria-expanded="false"
                        >
                            Ver más
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DescriptionCard;