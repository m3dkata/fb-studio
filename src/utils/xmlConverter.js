import { XMLParser } from 'fast-xml-parser';

 
export function parseXMLTemplate(xmlString, templateId) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    trimValues: true,
  });

  const result = parser.parse(xmlString);
  const makeup = result.makeup;

  return {
    templateId,
    version: makeup.version,
    contentVersion: makeup.content_version,
    eyeShadow: parseEyeShadow(makeup.eye_shadow, templateId),
    eyeLine: parseEyeLine(makeup.eye_line, templateId),
    eyeLash: parseEyeLash(makeup.eye_lash, templateId),
    lipstick: parseLipstick(makeup.lipstick, templateId),
    eyeBrow: parseEyeBrow(makeup.eye_brow, templateId),
    blush: parseBlush(makeup.blush, templateId),
    faceContour: parseFaceContour(makeup.face_contour_pattern, templateId),
    hairDye: parseHairDye(makeup.hair_dye, templateId),
    presets: parsePresets(makeup.presets, templateId),
  };
}

function parseEyeShadow(eyeShadow, templateId) {
  if (!eyeShadow) return null;

  return {
    patterns: parsePatterns(eyeShadow.patterns?.pattern, templateId),
    colors: parseColors(eyeShadow.colors?.color),
    palettes: parsePalettes(eyeShadow.palettes?.palette),
  };
}

function parseEyeLine(eyeLine, templateId) {
  if (!eyeLine) return null;

  return {
    patterns: parsePatterns(eyeLine.patterns?.pattern, templateId),
    palettes: parsePalettes(eyeLine.palettes?.palette),
  };
}

function parseEyeLash(eyeLash, templateId) {
  if (!eyeLash) return null;

  return {
    patterns: parsePatterns(eyeLash.patterns?.pattern, templateId),
    palettes: parsePalettes(eyeLash.palettes?.palette),
  };
}

function parseLipstick(lipstick, templateId) {
  if (!lipstick) return null;

  return {
    patterns: parsePatterns(lipstick.patterns?.pattern, templateId),
    palettes: parsePalettes(lipstick.palettes?.palette),
  };
}

function parseEyeBrow(eyeBrow, templateId) {
  if (!eyeBrow) return null;

  return {
    patterns: parsePatterns(eyeBrow.patterns?.pattern, templateId),
    palettes: parsePalettes(eyeBrow.palettes?.palette),
  };
}

function parseBlush(blush, templateId) {
  if (!blush) return null;

  return {
    patterns: parsePatterns(blush.patterns?.pattern, templateId),
    palettes: parsePalettes(blush.palettes?.palette),
  };
}

function parseFaceContour(faceContour, templateId) {
  if (!faceContour) return null;

  return {
    patterns: parsePatterns(faceContour.patterns?.pattern, templateId),
    palettes: parsePalettes(faceContour.palettes?.palette),
  };
}

function parseHairDye(hairDye, templateId) {
  if (!hairDye) return null;

  return {
    palettes: parsePalettes(hairDye.palettes?.palette),
  };
}

function parsePatterns(patterns, templateId) {
  if (!patterns) return [];

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];

  return patternArray.map(pattern => ({
    guid: pattern.guid,
    thumbnail: pattern.thumbnail ? `/makeup-templates/${templateId}/${pattern.thumbnail}` : null,
    textureSupportedMode: pattern.texture_supported_mode,
    masks: parseMasks(pattern.pattern_mask?.mask, templateId),
    lipstickProfile: pattern.lipstick_profile?.type,
    eyebrowMode3d: pattern.eyebrow_mode_3d?.type,
  }));
}

function parseMasks(masks, templateId) {
  if (!masks) return [];

  const maskArray = Array.isArray(masks) ? masks : [masks];

  return maskArray.map(mask => ({
    src: mask.src ? `/makeup-templates/${templateId}/${mask.src}` : null,
    position: mask.position,
    eyeLeft: parseCoordinate(mask.eyeleft),
    eyeRight: parseCoordinate(mask.eyeright),
    eyeTop: parseCoordinate(mask.eyetop),
    eyeBottom: parseCoordinate(mask.eyebottom),
    modelAnchorLeftTop: parseCoordinate(mask.modelanchorlefttop),
    
    browCurvature: mask.browcurvature,
    browDefinition: mask.browdefinition,
    browThickness: mask.browthickness,
    browPositionX: mask.browpositionx,
    browPositionY: mask.browpositiony,
    browHead3d: parseCoordinate(mask.browhead3d),
    browTail3d: parseCoordinate(mask.browtail3d),
    browTop3d: parseCoordinate(mask.browtop3d),
    shapeSrc3d: mask.shapesrc3d ? `/makeup-templates/${templateId}/${mask.shapesrc3d}` : null,
    featherSrc3d: mask.feathersrc3d ? `/makeup-templates/${templateId}/${mask.feathersrc3d}` : null,
  }));
}

function parsePalettes(palettes) {
  if (!palettes) return [];

  const paletteArray = Array.isArray(palettes) ? palettes : [palettes];

  return paletteArray.map(palette => ({
    guid: palette.guid,
    colors: parseColors(palette.colors?.color),
    levelColors: parseColors(palette.colors?.level_color),
    colorIntensities: parseIntensities(palette.color_intensities),
    shimmerIntensities: parseIntensities(palette.shimmer_intensities),
    shineIntensities: parseIntensities(palette.shine_intensities),
    colorIsShimmers: parseShimmers(palette.color_is_shimmers?.color_is_shimmer),
    patterns: parsePatternRefs(palette.patterns?.pattern_guid),
  }));
}

function parsePresets(presets, templateId) {
  if (!presets?.preset) return [];

  const presetArray = Array.isArray(presets.preset) ? presets.preset : [presets.preset];

  return presetArray.map(preset => ({
    guid: preset.guid,
    name: preset.name?.def || preset.name?.enu || 'Unnamed',
    thumbnail: preset.thumbnail ? `/makeup-templates/${templateId}/${preset.thumbnail}` : null,
    isPremium: preset.is_premium === 'true',
    lookType: preset.look_type,
    supportedMode: preset.supported_mode,
    lookCategories: parseLookCategories(preset.look_categories),
    effects: parseEffects(preset.effect),
  }));
}

function parseEffects(effects) {
  if (!effects) return [];

  const effectArray = Array.isArray(effects) ? effects : [effects];

  return effectArray.map(effect => ({
    type: effect.effect_type,
    colors: parseColors(effect.colors?.color),
    levelColors: parseColors(effect.colors?.level_color),
    colorIntensities: parseIntensities(effect.color_intensities?.color_intensity),
    shimmerIntensities: parseIntensities(effect.shimmer_intensities?.shimmer_intensity),
    shineIntensities: parseIntensities(effect.shine_intensities?.shine_intensity),
    colorIsShimmers: parseShimmers(effect.color_is_shimmers?.color_is_shimmer),
    patternGuid: effect.pattern_guid,
    paletteGuid: effect.palette_guid,
    patterns: parseEffectPatterns(effect.patterns?.pattern),
    globalIntensity: effect.global_intensity,
    intensity: effect.intensity,
    
    browCurvature: effect.browcurvature,
    browDefinition: effect.browdefinition,
    browThickness: effect.browthickness,
    browPositionX: effect.browpositionx,
    browPositionY: effect.browpositiony,
    hiddenIntensity: effect.hidden_intensity,
    
    ombreRange: effect.ombre_range,
    ombreLineOffset: effect.ombre_line_offset,
    
    coloredMaskIndex: effect.colored_mask_index,
    position: effect.position,
    
    itemGuid: effect.item_guid,
    packGuid: effect.pack_guid,
  }));
}

function parseEffectPatterns(patterns) {
  if (!patterns) return [];

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];

  return patternArray.map(pattern => ({
    patternGuid: pattern.pattern_guid,
    patternMaskIndex: pattern.pattern_mask_index,
    palettes: pattern.palettes?.palette ? (Array.isArray(pattern.palettes.palette) ? pattern.palettes.palette : [pattern.palettes.palette]) : [],
  }));
}

function parseLookCategories(lookCategories) {
  if (!lookCategories?.look_category) return [];

  const categoryArray = Array.isArray(lookCategories.look_category)
    ? lookCategories.look_category
    : [lookCategories.look_category];

  return categoryArray.map(cat => cat.def || cat);
}

function parseColors(colors) {
  if (!colors) return [];

  const colorArray = Array.isArray(colors) ? colors : [colors];
  return colorArray.map(color => hexToRGBA(color));
}

function parseIntensities(intensities) {
  if (!intensities) return [];

  if (typeof intensities === 'string') {
    return intensities.split(',').map(i => parseInt(i.trim()));
  }

  const intensityArray = Array.isArray(intensities) ? intensities : [intensities];
  return intensityArray.map(i => typeof i === 'number' ? i : parseInt(i));
}

function parseShimmers(shimmers) {
  if (!shimmers) return [];

  const shimmerArray = Array.isArray(shimmers) ? shimmers : [shimmers];
  return shimmerArray.map(s => s === 1 || s === '1');
}

function parsePatternRefs(patternRefs) {
  if (!patternRefs) return [];

  const refArray = Array.isArray(patternRefs) ? patternRefs : [patternRefs];

  return refArray.map(ref => {
    if (typeof ref === 'string') {
      return { guid: ref, colorIntensities: [] };
    }

    let colorIntensities = [];
    if (ref.color_intensities) {
      if (typeof ref.color_intensities === 'string') {
        colorIntensities = ref.color_intensities.split(',').map(i => parseInt(i.trim()));
      } else if (Array.isArray(ref.color_intensities)) {
        colorIntensities = ref.color_intensities.map(i => typeof i === 'number' ? i : parseInt(i));
      } else if (typeof ref.color_intensities === 'number') {
        colorIntensities = [ref.color_intensities];
      }
    }

    return {
      guid: ref['#text'] || ref,
      colorIntensities,
    };
  });
}

function parseCoordinate(coord) {
  if (!coord) return null;

  const parts = coord.toString().split(',');
  return {
    x: parseInt(parts[0]),
    y: parseInt(parts[1]),
  };
}

 
function hexToRGBA(hex) {
  if (!hex) return { r: 0, g: 0, b: 0, a: 1 };

  let hexStr;
  if (typeof hex === 'number') {
    
    
    hexStr = (hex >>> 0).toString(16).toUpperCase().padStart(8, '0');
  } else {
    hexStr = hex.toString().padStart(8, '0');
  }

  
  
  const a = parseInt(hexStr.substring(0, 2), 16) / 255;
  const b = parseInt(hexStr.substring(2, 4), 16); 
  const g = parseInt(hexStr.substring(4, 6), 16);
  const r = parseInt(hexStr.substring(6, 8), 16); 

  return { r, g, b, a };
}

 
export async function loadTemplate(templateId) {
  try {
    const response = await fetch(`/makeup-templates/${templateId}/makeup.xml`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }

    const xmlString = await response.text();
    return parseXMLTemplate(xmlString, templateId);
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    throw error;
  }
}

 
export async function discoverTemplates() {
  
  return [];
}
