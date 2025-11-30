import { useState, useCallback } from 'react';

/**
 * Custom hook for managing CRUD modal state
 * Extracts shared modal patterns from admin pages (ManageServices, ManageBookings, ManageSlots)
 * 
 * @param {Function} resetForm - React Hook Form reset function
 * @param {Function} setValue - React Hook Form setValue function
 * @returns {Object} Modal state and control functions
 */
export const useCrudModal = (resetForm, setValue) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    /**
     * Open modal for creating a new item
     * @param {Object} defaults - Default form values
     */
    const openCreate = useCallback((defaults = {}) => {
        setEditingItem(null);
        resetForm(defaults);
        setIsOpen(true);
    }, [resetForm]);

    /**
     * Open modal for editing an existing item
     * @param {Object} item - Item to edit
     * @param {Object} fieldMapping - Map of form fields to item properties
     * Example: { title: item.title, price: item.price }
     */
    const openEdit = useCallback((item, fieldMapping) => {
        setEditingItem(item);

        // Set form values from field mapping
        Object.entries(fieldMapping).forEach(([fieldName, value]) => {
            setValue(fieldName, value);
        });

        setIsOpen(true);
    }, [setValue]);

    /**
     * Close modal and reset state
     */
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
