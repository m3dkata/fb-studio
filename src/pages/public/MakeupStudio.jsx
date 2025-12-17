import { useState, useEffect } from 'react';
import { MakeupPreview } from '../../components/MakeupPreview';
import { TemplateSelector } from '../../components/TemplateSelector';
import { useTemplates } from '../../hooks/useTemplates';
export function MakeupStudio() {
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    
    const { templates, isLoading: isLoadingTemplates } = useTemplates();

    
    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].templateId);
        }
    }, [templates, selectedTemplateId]);

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplateId(templateId);
        
        if (window.innerWidth <= 768) {
            setShowTemplateSelector(false);
        }
    };

    return (
        <div className="makeup-studio">
            { }
            <aside className={`template-sidebar ${showTemplateSelector ? 'show' : ''}`}>
                <TemplateSelector
                    templates={templates}
                    selectedTemplateId={selectedTemplateId}
                    onSelect={handleTemplateSelect}
                />
            </aside>

            { }
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

            { }
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
