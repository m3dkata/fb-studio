import { useState } from 'react';
export function TemplateSelector({ templates = [], selectedTemplateId, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Extract unique categories
    const categories = ['All', ...new Set(
        templates.flatMap(t =>
            t.presets?.flatMap(p => p.lookCategories || []) || []
        )
    )];

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        // Search filter
        const matchesSearch = !searchQuery ||
            template.presets?.some(p =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );

        // Category filter
        const matchesCategory = selectedCategory === 'All' ||
            template.presets?.some(p =>
                p.lookCategories?.includes(selectedCategory)
            );

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="template-selector">
            <div className="selector-header">
                <h2>Makeup Templates</h2>

                {/* Search */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {/* Category filter */}
                <div className="category-filter">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template grid */}
            <div className="template-grid">
                {filteredTemplates.length === 0 ? (
                    <div className="no-templates">
                        <p>No templates found</p>
                        <small>Try adjusting your search or filters</small>
                    </div>
                ) : (
                    filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.templateId}
                            template={template}
                            isSelected={template.templateId === selectedTemplateId}
                            onSelect={() => onSelect(template.templateId)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * Individual template card
 */
function TemplateCard({ template, isSelected, onSelect }) {
    const preset = template.presets?.[0]; // Show first preset

    return (
        <div
            className={`template-card ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            {preset?.thumbnail && (
                <div className="template-thumbnail">
                    <img src={preset.thumbnail} alt={preset.name} />
                    {preset.isPremium && (
                        <span className="premium-badge">★ Premium</span>
                    )}
                </div>
            )}

            <div className="template-info">
                <h3>{preset?.name || template.templateId}</h3>

                {preset?.lookType && (
                    <span className="look-type">{preset.lookType}</span>
                )}

                {preset?.lookCategories && preset.lookCategories.length > 0 && (
                    <div className="categories">
                        {preset.lookCategories.map(cat => (
                            <span key={cat} className="category-tag">{cat}</span>
                        ))}
                    </div>
                )}

                {template.presets && template.presets.length > 1 && (
                    <small className="preset-count">
                        {template.presets.length} presets available
                    </small>
                )}
            </div>
        </div>
    );
}

export default TemplateSelector;
