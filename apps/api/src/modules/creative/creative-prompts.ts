export type CreativeKind = 'character' | 'art' | 'comic' | 'video'

export type CreativeDetails = {
  appearance?: string
  personality?: string
  preserve?: string
  styleId?: 'watercolor' | 'cartoon' | 'crayon' | 'anime' | 'manga' | 'comic' | 'sketch' | '3d' | 'pixel' | 'chibi' | 'clay' | 'fabric' | 'manhwa' | 'semirealistic' | 'paper-cut'
  panelCount?: 2 | 4 | 6
  panels?: Array<{ action: string; dialogue?: string }>
  motion?: string
}

// ─── Art style descriptors ────────────────────────────────────────────────────
// Mỗi entry là chuỗi keyword kỹ thuật được research dựa trên best practices
// của AI image generation (Midjourney, DALL-E, Stable Diffusion communities).
// Nguyên tắc: càng cụ thể về chất liệu + kỹ thuật → AI càng ra đúng phong cách.
const artStyles: Record<string, string> = {

  // Màu Nước — mô phỏng chất liệu giấy + màu nước thật
  // Keywords: wet-on-wet bleeding, pigment pooling, paper texture
  watercolor:
    'watercolor painting on cold-pressed paper, soft wet-on-wet washes, gentle edge blooms and pigment pooling, translucent layered color, visible paper grain texture, luminous hand-painted finish, storybook illustration aesthetic',

  // Hoạt Hình — phong cách 2D animation truyền thống phương Tây (Cartoon Network, Disney)
  // Keywords: bold outline, flat color fills, playful proportions
  cartoon:
    'classic 2D cartoon animation style, bold clean ink outlines, flat vibrant color fills, exaggerated expressive features, playful character proportions, cel-shading, whimsical storybook illustration',

  // Bút Sáp — chất liệu sáp màu thủ công, có kết cấu sần và nét phóng khoáng
  // Keywords: waxy texture, wax-grain friction, imperfect crayon strokes
  crayon:
    'wax crayon drawing, thick imperfect crayon strokes with visible wax-grain texture, scribble marks and uneven color pressure, bold outlines with a hand-drawn childlike feel, warm analog pigment colors, matte paper surface',

  // Anime — phong cách hoạt hình Nhật Bản: mắt to, tô cel, màu tươi sáng
  // Keywords: cel shading, expressive eyes, vivid anime palette
  anime:
    'high-quality anime illustration, clean crisp linework, large expressive sparkling eyes, cel-shaded coloring with soft gradient highlights, vivid saturated color palette, dynamic composition, cinematic anime lighting, masterpiece quality',

  // Manga — truyện tranh Nhật Bản: đen trắng, screentone, nét bút mực
  // Keywords: screentone, pen and ink, monochrome manga
  manga:
    'black-and-white manga illustration, sharp crisp pen-and-ink linework, screentone dot patterns for shading, high contrast monochrome, detailed crosshatching, dramatic ink shadows, expressive manga character design',

  // Truyện Tranh — phong cách comic book Mỹ: nét đậm, halftone, góc cạnh
  // Keywords: bold ink outlines, halftone dots, graphic novel composition
  comic:
    'American comic book illustration style, bold thick ink outlines, cel-shaded flat color fields, classic Ben-Day halftone dot patterns, dramatic shadows and highlights, dynamic energetic composition, graphic novel aesthetic',

  // Tranh Chì — phác thảo bút chì + đổ bóng chi tiết
  // Keywords: graphite shading, crosshatch, visible pencil texture
  sketch:
    'detailed pencil sketch illustration, fine graphite linework with visible pencil grain texture, soft blending and careful crosshatch shading, subtle tonal range, sketchbook aesthetic on white paper, expressive hand-drawn lines with light watercolor wash accents',

  // 3D — CGI 3D render phong cách Pixar/Blender: bề mặt mịn, ánh sáng chuẩn
  // Keywords: stylized 3D CGI, smooth geometry, ray-traced lighting
  '3d':
    'stylized 3D CGI illustration, Pixar-quality smooth character geometry, vibrant matte color palette, ray-traced soft studio lighting with gentle ambient occlusion, clean rounded forms, polished high-end animation render',

  // Pixel — pixel art retro game: cạnh sắc, bảng màu giới hạn, không anti-aliasing
  // Keywords: crisp pixel edges, limited palette, no anti-aliasing, retro sprite
  pixel:
    '16-bit retro pixel art, crisp hard pixel edges with no anti-aliasing, limited color palette, visible pixel grid, dithering pattern shading, classic JRPG sprite aesthetic, retro video game character design',

  // Chibi — phong cách cute Nhật Bản: đầu to, người nhỏ, mắt long lanh
  // Keywords: kawaii chibi, oversized round head, huge sparkly eyes, stubby limbs
  chibi:
    'kawaii chibi illustration, oversized round head with a tiny cute body (1:2 head-to-body ratio), huge sparkly expressive eyes with rosy cheeks, stubby little limbs, pastel soft color palette, adorable minimalist detail, cheerful sticker-like composition',

  // Đất Sét — phong cách claymation/plasticine thủ công
  // Keywords: plasticine texture, fingerprint marks, stop-motion aesthetic, matte clay
  clay:
    'colorful claymation plasticine illustration, visible clay texture with subtle fingerprint and tool marks, matte clay surface with gentle compression ridges, warm diorama studio lighting with shallow depth-of-field, handcrafted stop-motion animation aesthetic',

  // Vải Nỉ — minh họa bằng chất liệu vải felt/nỉ thủ công
  // Keywords: felt fabric, blanket stitch, fuzzy fiber texture, handmade applique
  fabric:
    'felt fabric textile illustration, soft fuzzy wool-felt texture with visible blanket stitch outlines, handmade fabric applique layers, cozy warm muted color palette, tactile handcrafted aesthetic, gentle fabric fiber detail',

  // Manhwa — webtoon Hàn Quốc: full color, nét mảnh, bóng mượt, bóng bảy
  // Keywords: webtoon style, polished digital painting, vibrant and sharp, glossy finish
  manhwa:
    'modern manhwa webtoon illustration, fully colored with polished digital painting finish, delicate sharp linework, smooth luminous shading, vibrant saturated palette with dramatic lighting, glossy hair and expressive eyes, high-resolution webtoon aesthetic',

  // Bán Tả Thực — giữa phong cách stylized và tả thực: tỷ lệ đẹp + chi tiết sáng/tối
  // Keywords: semi-realistic, stylized proportions, detailed shading, painterly
  semirealistic:
    'semi-realistic digital illustration, stylized character proportions with detailed painterly shading, soft natural lighting with careful chiaroscuro, rich texture detail on skin and fabric, refined artistic quality between stylized and photorealistic',

  // Cắt Giấy — nghệ thuật giấy xếp tầng, bóng đổ giữa các lớp
  // Keywords: layered paper-cut, shadow box, stacked paper layers, clean cut edges
  'paper-cut':
    'layered paper-cut illustration, stacked construction-paper shapes with clean crisp cut edges, visible drop shadows between paper layers creating depth, shadow-box diorama effect, flat graphic silhouettes with warm ambient lighting, handcraft papercraft aesthetic',
}

/** The server, not the browser, owns generation framing and safety cues. */
export function buildCreativePrompt(kind: CreativeKind, title: string, idea: string, details: CreativeDetails): string {
  switch (kind) {
    case 'character':
      return `${title}: ${idea}. Character appearance: ${details.appearance || 'friendly child-safe design'}. Personality: ${details.personality || 'curious and kind'}. Full body character sheet, simple pastel background, no text, no watermark.`
    case 'art':
      // Cân bằng: trung thành ý tưởng nét vẽ (chủ đề, bố cục, nhân vật)
      // nhưng thể hiện lại theo phong cách đẹp — không copy nét xấu, không bỏ qua hoàn toàn.
      return `Look at the provided sketch carefully and identify: the main subject(s), their approximate positions, ` +
        `and the overall theme or story the child is trying to tell. ` +
        `Then recreate that same subject and composition as a beautiful, high-quality ${artStyles[details.styleId ?? 'clay']}. ` +
        `Keep the core idea and characters faithful to the sketch, but render them with professional quality, ` +
        `rich detail, and vibrant colors — the way a skilled children's book illustrator would reimagine it. ` +
        `The artwork must be 100% child-safe and age-appropriate for ages 6–15: ` +
        `bright cheerful palette, friendly characters, wholesome atmosphere, no violence, no scary imagery, no adult content. ` +
        `No text, no watermark, no border.`
    case 'comic':
      return `${title}: ${idea}. A ${details.panelCount ?? 4}-panel children's comic page with clear left-to-right visual storytelling. Panel plan: ${(details.panels ?? []).map((panel, index) => `Panel ${index + 1}: ${panel.action}${panel.dialogue ? `; mood or dialogue: ${panel.dialogue}` : ''}`).join(' | ') || 'show a clear beginning, challenge, action and ending'}. Consistent characters, no speech bubbles, no text, no watermark.`
    case 'video':
      return `${title}: ${idea}. Motion: ${details.motion || 'a gentle wave and a small joyful movement'}. A short child-safe scene, no on-screen text, no watermark.`
  }
}
