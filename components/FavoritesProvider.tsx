
import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

interface FavoritesContextType {
    favoriteIds: number[];
    addFavorite: (id: number) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'rago-favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (storedFavorites) {
                setFavoriteIds(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Could not load favorites from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
        } catch (error) {
            console.error("Could not save favorites to localStorage", error);
        }
    }, [favoriteIds]);

    const addFavorite = useCallback((id: number) => {
        setFavoriteIds(prev => [...prev, id]);
    }, []);

    const removeFavorite = useCallback((id: number) => {
        setFavoriteIds(prev => prev.filter(favId => favId !== id));
    }, []);

    const isFavorite = useCallback((id: number) => {
        return favoriteIds.includes(id);
    }, [favoriteIds]);

    const value = { favoriteIds, addFavorite, removeFavorite, isFavorite };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
