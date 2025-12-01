import { useState, useEffect } from 'react';
import { loadAllTemplates } from '../utils/templateLoader';
export function useTemplates() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAllTemplates()
            .then(loadedTemplates => {
                setTemplates(loadedTemplates);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load templates:', err);
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    return {
        templates,
        isLoading,
        error,
    };
}

export default useTemplates;
