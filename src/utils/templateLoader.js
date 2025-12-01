import { loadTemplate } from './xmlConverter';
export async function loadAllTemplates() {
    try {
        // Load lightweight metadata first
        const response = await fetch('/makeup-templates/templates-metadata.json');
        if (!response.ok) {
            console.warn('No templates-metadata.json found, falling back to legacy load');
            // Fallback to old method if metadata missing
            return await loadLegacyTemplates();
        }

        const metadata = await response.json();

        // Map metadata to template structure expected by UI
        return metadata.map(item => ({
            templateId: item.templateId,
            presets: [{
                guid: item.templateId,
                name: item.name,
                thumbnail: item.thumbnail,
                isPremium: item.isPremium,
                lookType: item.lookType,
                lookCategories: item.lookCategories
            }]
        }));
    } catch (error) {
        console.error('Failed to load templates:', error);
        return [];
    }
}

async function loadLegacyTemplates() {
    try {
        const response = await fetch('/makeup-templates/templates.json');
        if (!response.ok) return [];
        const manifest = await response.json();

        const templates = await Promise.all(
            manifest.map(async (item) => {
                try {
                    return await loadTemplate(item.id);
                } catch (error) {
                    return null;
                }
            })
        );
        return templates.filter(t => t !== null);
    } catch (error) {
        return [];
    }
}
export async function getTemplateById(templateId) {
    try {
        return await loadTemplate(templateId);
    } catch (error) {
        console.error(`Failed to load template ${templateId}:`, error);
        return null;
    }
}
export function searchTemplates(templates, query) {
    const lowerQuery = query.toLowerCase();

    return templates.filter(template => {
        const matchesName = template.presets?.some(p =>
            p.name?.toLowerCase().includes(lowerQuery)
        );

        const matchesCategory = template.presets?.some(p =>
            p.lookCategories?.some(cat =>
                cat.toLowerCase().includes(lowerQuery)
            )
        );

        return matchesName || matchesCategory;
    });
}
export function filterByCategory(templates, category) {
    if (category === 'All') return templates;

    return templates.filter(template =>
        template.presets?.some(p =>
            p.lookCategories?.includes(category)
        )
    );
}
export function getCategories(templates) {
    const categories = new Set();

    templates.forEach(template => {
        template.presets?.forEach(preset => {
            preset.lookCategories?.forEach(cat => {
                categories.add(cat);
            });
        });
    });

    return Array.from(categories).sort();
}

export default {
    loadAllTemplates,
    getTemplateById,
    searchTemplates,
    filterByCategory,
    getCategories,
};
