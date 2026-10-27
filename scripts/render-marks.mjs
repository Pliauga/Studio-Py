// Rasterize the authored SVG marks once, at build time.
//
// The marks are halftone plates with turbulence filters. Left as SVG, the browser
// re-runs those filters for every one of the 25 unique plates on first paint, which
// blocks the compositor for seconds. They are therefore composited into one 5x5
// WebP atlas: the browser decodes a single bitmap and every card crops its own cell.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const DIR = 'static/marks';
const SIZE = 512;
const QUALITY = 0.92;
const COLS = 5;

const files = (await readdir(DIR)).filter((file) => /^w\d{2}\.svg$/.test(file)).sort();
if (files.length === 0) throw new Error(`No SVG marks found in ${DIR}`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

const hrefs = [];
for (const file of files) {
	const svg = await readFile(path.join(DIR, file), 'utf8');
	const href = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
	hrefs.push(href);
	const data = await page.evaluate(
		async ({ href, size, quality }) => {
			const image = new Image();
			image.src = href;
			await image.decode();
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('No 2D context');
			ctx.drawImage(image, 0, 0, size, size);
			return canvas.toDataURL('image/webp', quality).split(',')[1];
		},
		{ href, size: SIZE, quality: QUALITY }
	);
	const out = path.join(DIR, file.replace(/\.svg$/, '.webp'));
	await writeFile(out, Buffer.from(data, 'base64'));
	console.log(`${out} ${(Buffer.from(data, 'base64').length / 1024).toFixed(1)} kB`);
}

const sheet = await page.evaluate(
	async ({ hrefs, size, cols, quality }) => {
		const rows = Math.ceil(hrefs.length / cols);
		const canvas = document.createElement('canvas');
		canvas.width = cols * size;
		canvas.height = rows * size;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('No 2D context');
		for (let index = 0; index < hrefs.length; index += 1) {
			const image = new Image();
			image.src = hrefs[index];
			await image.decode();
			ctx.drawImage(image, (index % cols) * size, Math.floor(index / cols) * size, size, size);
		}
		return canvas.toDataURL('image/webp', quality).split(',')[1];
	},
	{ hrefs, size: SIZE, cols: COLS, quality: QUALITY }
);
const sheetPath = path.join(DIR, 'sheet.webp');
await writeFile(sheetPath, Buffer.from(sheet, 'base64'));
console.log(`${sheetPath} ${(Buffer.from(sheet, 'base64').length / 1024).toFixed(1)} kB`);

await browser.close();
