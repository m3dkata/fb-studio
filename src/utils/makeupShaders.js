function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
export function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}
export const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;
export const MULTIPLY_BLEND_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_base;
  uniform sampler2D u_blend;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 blend = texture2D(u_blend, v_texCoord);
    
    vec3 result = base.rgb * blend.rgb;
    result = mix(base.rgb, result, u_intensity * blend.a);
    
    gl_FragColor = vec4(result, base.a);
  }
`;
export const SCREEN_BLEND_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_base;
  uniform sampler2D u_blend;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 blend = texture2D(u_blend, v_texCoord);
    
    vec3 result = vec3(1.0) - (vec3(1.0) - base.rgb) * (vec3(1.0) - blend.rgb);
    result = mix(base.rgb, result, u_intensity * blend.a);
    
    gl_FragColor = vec4(result, base.a);
  }
`;
export const OVERLAY_BLEND_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_base;
  uniform sampler2D u_blend;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  float overlayComponent(float base, float blend) {
    return base < 0.5 
      ? 2.0 * base * blend 
      : 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
  }
  
  void main() {
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 blend = texture2D(u_blend, v_texCoord);
    
    vec3 result = vec3(
      overlayComponent(base.r, blend.r),
      overlayComponent(base.g, blend.g),
      overlayComponent(base.b, blend.b)
    );
    
    result = mix(base.rgb, result, u_intensity * blend.a);
    
    gl_FragColor = vec4(result, base.a);
  }
`;
export const SOFT_LIGHT_BLEND_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_base;
  uniform sampler2D u_blend;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  float softLightComponent(float base, float blend) {
    return blend < 0.5
      ? 2.0 * base * blend + base * base * (1.0 - 2.0 * blend)
      : sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
  }
  
  void main() {
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 blend = texture2D(u_blend, v_texCoord);
    
    vec3 result = vec3(
      softLightComponent(base.r, blend.r),
      softLightComponent(base.g, blend.g),
      softLightComponent(base.b, blend.b)
    );
    
    result = mix(base.rgb, result, u_intensity * blend.a);
    
    gl_FragColor = vec4(result, base.a);
  }
`;
export const COLOR_TINT_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform vec4 u_color;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 texColor = texture2D(u_texture, v_texCoord);
    
    // Apply color tint
    vec3 tinted = texColor.rgb * u_color.rgb;
    vec3 result = mix(texColor.rgb, tinted, u_intensity);
    
    gl_FragColor = vec4(result, texColor.a * u_color.a);
  }
`;
export const SHIMMER_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_intensity;
  uniform vec2 u_resolution;
  
  varying vec2 v_texCoord;
  
  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Noise function
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec4 texColor = texture2D(u_texture, v_texCoord);
    
    // Create sparkle pattern
    vec2 st = v_texCoord * u_resolution * 0.1;
    float n = noise(st + u_time * 0.5);
    
    // Animated sparkles
    float sparkle = pow(n, 3.0) * (sin(u_time * 3.0 + n * 10.0) * 0.5 + 0.5);
    
    // Add shimmer to bright areas
    vec3 shimmer = vec3(sparkle) * u_intensity;
    vec3 result = texColor.rgb + shimmer * texColor.a;
    
    gl_FragColor = vec4(result, texColor.a);
  }
`;
export const ALPHA_COMPOSITE_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_base;
  uniform sampler2D u_overlay;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 base = texture2D(u_base, v_texCoord);
    vec4 overlay = texture2D(u_overlay, v_texCoord);
    
    // Adjust overlay alpha by intensity
    overlay.a *= u_intensity;
    
    // Alpha compositing
    float outAlpha = overlay.a + base.a * (1.0 - overlay.a);
    vec3 outColor = (overlay.rgb * overlay.a + base.rgb * base.a * (1.0 - overlay.a)) / max(outAlpha, 0.001);
    
    gl_FragColor = vec4(outColor, outAlpha);
  }
`;
export const WARP_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform sampler2D u_warpMap;
  uniform float u_intensity;
  
  varying vec2 v_texCoord;
  
  void main() {
    // Read warp offset from warp map (RG channels)
    vec4 warp = texture2D(u_warpMap, v_texCoord);
    vec2 offset = (warp.rg - 0.5) * 2.0 * u_intensity;
    
    // Sample texture with warped coordinates
    vec2 warpedCoord = v_texCoord + offset * 0.1;
    vec4 color = texture2D(u_texture, warpedCoord);
    
    gl_FragColor = color;
  }
`;
export const BlendMode = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  SOFT_LIGHT: 'soft_light',
};
export function getBlendShader(blendMode) {
  switch (blendMode) {
    case BlendMode.MULTIPLY:
      return MULTIPLY_BLEND_SHADER;
    case BlendMode.SCREEN:
      return SCREEN_BLEND_SHADER;
    case BlendMode.OVERLAY:
      return OVERLAY_BLEND_SHADER;
    case BlendMode.SOFT_LIGHT:
      return SOFT_LIGHT_BLEND_SHADER;
    default:
      return ALPHA_COMPOSITE_SHADER;
  }
}
export function setupQuad(gl) {
  const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
  ]);

  const texCoords = new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  return { positionBuffer, texCoordBuffer };
}
export function createTexture(gl, image) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
}
export async function loadTexture(gl, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const texture = createTexture(gl, image);
      resolve(texture);
    };

    image.onerror = reject;
    image.src = url;
  });
}
