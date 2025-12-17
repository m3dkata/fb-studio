import { useState, useCallback } from 'react';

 
export const useCrudModal = (resetForm, setValue) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

     
    const openCreate = useCallback((defaults = {}) => {
        setEditingItem(null);
        resetForm(defaults);
        setIsOpen(true);
    }, [resetForm]);

     
    const openEdit = useCallback((item, fieldMapping) => {
        setEditingItem(item);

        
        Object.entries(fieldMapping).forEach(([fieldName, value]) => {
            setValue(fieldName, value);
        });

        setIsOpen(true);
    }, [setValue]);

     
    const close = useCallback(() => {
        setIsOpen(false);
        setEditingItem(null);
        resetForm();
    }, [resetForm]);

    return {
        isOpen,
        editingItem,
        openCreate,
        openEdit,
        close
    };
};

export default useCrudModal;
