import { useState, useEffect } from 'react';
import { MakeupPreview } from '../components/MakeupPreview';
import { TemplateSelector } from '../components/TemplateSelector';
import { useTemplates } from '../hooks/useTemplates';
export function MakeupStudio() {
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Use custom hook for template management
    const { templates, isLoading: isLoadingTemplates } = useTemplates();

    // Auto-select first template when templates load
    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].templateId);
        }
    }, [templates, selectedTemplateId]);

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplateId(templateId);
        // On mobile, hide selector after selection
        if (window.innerWidth <= 768) {
            setShowTemplateSelector(false);
        }
    };

    return (
        <div className="makeup-studio">
            {/* Template Selector Sidebar */}
            <aside className={`template-sidebar ${showTemplateSelector ? 'show' : ''}`}>
                <TemplateSelector
                    templates={templates}
                    selectedTemplateId={selectedTemplateId}
                    onSelect={handleTemplateSelect}
                />
            </aside>

            {/* Main Preview Container */}
            <div className="preview-container">
                {selectedTemplateId ? (
                    <MakeupPreview
                        templateId={selectedTemplateId}
                        onTemplateChange={setSelectedTemplateId}
                    />
                ) : (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading Studio...</p>
                    </div>
                )}

            </div>

            {/* Toggle Button */}
            <button
                className="show-templates-btn"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            >
                ✨ Looks
            </button>

        </div>
    );
}

export default MakeupStudio;
