/**
 * Pipeline de assets da V1.
 * Fontes originais em /assets-src → saídas otimizadas em /public/assets.
 * Ao receber assets definitivos (ex.: pizza já recortada em PNG transparente),
 * substitua o arquivo em /assets-src e ajuste/remova a etapa correspondente.
 *
 *   node scripts/build-assets.mjs
 */
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const SRC = 'assets-src';
const OUT = 'public/assets';

/** Aplica uma máscara SVG (branco = visível) como canal alfa. */
async function applyMask(file, maskSvg) {
  const img = sharp(`${SRC}/${file}`);
  const { width: W, height: H } = await img.metadata();
  const m = await sharp(Buffer.from(maskSvg(W, H)), { density: 72 })
    .resize(W, H).greyscale().raw().toBuffer();
  const rgb = await img.removeAlpha().raw().toBuffer();
  const mc = m.length / (W * H);
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    out[i * 4] = rgb[i * 3];
    out[i * 4 + 1] = rgb[i * 3 + 1];
    out[i * 4 + 2] = rgb[i * 3 + 2];
    out[i * 4 + 3] = m[i * mc];
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } });
}

// 1) Pizza vista de cima → recorte elíptico (a foto tem leve perspectiva),
//    normalizado para um círculo perfeito 1080×1080.
{
  const cx = 767, cy = 586, rx = 543, ry = 533;
  const masked = await applyMask('pizza-topdown.png', (W, H) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><filter id="f"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
      <rect width="100%" height="100%"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 3}" ry="${ry - 3}" fill="#fff" filter="url(#f)"/>
    </svg>`);
  const crop = await masked.extract({ left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2 }).png().toBuffer();
  await sharp(crop).resize(1080, 1080, { fit: 'fill' }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/pizza-topdown.webp`);
}

// 4) Logo raster → vetor (PROVISÓRIO até recebermos o SVG oficial).
//    Gera partes separadas para poder animar ícone e lettering de forma independente.
{
  const K = 2; // escala de trace
  const parts = {
    full: [24, 42, 862, 652],
    icon: [270, 42, 378, 214],
    wordmark: [24, 280, 860, 276],
  };
  const trace = promisify(potrace.trace);
  const result = {};
  for (const [name, [left, top, width, height]] of Object.entries(parts)) {
    const buf = await sharp(`${SRC}/logo-raster.png`).extract({ left, top, width, height })
      .resize(width * K).greyscale().negate({ alpha: false }).png().toBuffer();
    const svg = await trace(buf, { threshold: 145, turdSize: 30, optTolerance: 0.6, alphaMax: 1 });
    result[name] = { viewBox: `0 0 ${width * K} ${height * K}`, d: svg.match(/ d="([^"]+)"/)[1] };
  }
  await writeFile('src/assets/logo-paths.json', JSON.stringify(result));
}

console.log('assets ok');
