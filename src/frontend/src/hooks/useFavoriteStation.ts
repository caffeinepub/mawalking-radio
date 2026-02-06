import { useState, useEffect } from 'react';

const FAVORITE_KEY = 'mawalking_radio_favorite';

export function useFavoriteStation() {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITE_KEY);
    setIsFavorite(stored === 'true');
  }, []);

  const toggleFavorite = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    localStorage.setItem(FAVORITE_KEY, String(newValue));
  };

  return {
    isFavorite,
    toggleFavorite,
  };
}
