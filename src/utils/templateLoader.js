import { loadTemplate } from './xmlConverter';
export async function loadAllTemplates() {
    try {
        const response = await fetch('/makeup-templates/templates.json');
        if (!response.ok) {
            console.warn('No templates.json found, returning empty array');
            return [];
        }

        const manifest = await response.json();

        // Load each template
        const templates = await Promise.all(
            manifest.map(async (item) => {
                try {
                    const template = await loadTemplate(item.id);
                    return template;
                } catch (error) {
                    return null;
                }
            })
        );

        const validTemplates = templates.filter(t => t !== null);
        return validTemplates;
    } catch (error) {
        console.error('Failed to load templates:', error);
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
