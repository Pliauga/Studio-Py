#!/usr/bin/env node
/**
 * Generates the 25 plate marks for the Studio Py index.
 * Each mark is a procedural halftone/technical plate, keyed to a module week.
 * Run: node scripts/generate-marks.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'static', 'marks');
const SIZE = 200;
const INK = '#000';

const families = ['radar', 'strata', 'lattice', 'contour', 'waveform'];

const SEGMENTS = {
	0: ['a', 'b', 'c', 'd', 'e', 'f'],
	1: ['b', 'c'],
	2: ['a', 'b', 'g', 'e', 'd'],
	3: ['a', 'b', 'g', 'c', 'd'],
	4: ['f', 'g', 'b', 'c'],
	5: ['a', 'f', 'g', 'c', 'd'],
	6: ['a', 'f', 'g', 'e', 'c', 'd'],
	7: ['a', 'b', 'c'],
	8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
	9: ['a', 'b', 'c', 'd', 'f', 'g']
};

// Seven-segment glyphs on a 48 x 82 cell. Two digits, drawn as a pair.
const SEG = {
	a: 'M7 4 H41',
	b: 'M44 7 V39',
	c: 'M44 43 V75',
	d: 'M7 78 H41',
	e: 'M4 43 V75',
	f: 'M4 7 V39',
	g: 'M7 41 H41'
};

const f = (n) => Number(n.toFixed(2));
const rad = (deg) => (deg * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [f(cx + r * Math.cos(rad(deg))), f(cy + r * Math.sin(rad(deg)))];

function sector(cx, cy, outer, inner, from, to) {
	const [x1, y1] = pt(cx, cy, outer, from);
	const [x2, y2] = pt(cx, cy, outer, to);
	const [x3, y3] = pt(cx, cy, inner, to);
	const [x4, y4] = pt(cx, cy, inner, from);
	const large = to - from > 180 ? 1 : 0;
	return `M${x1} ${y1} A${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}

function digitPaths(twoDigits, dx) {
	let out = '';
	for (let i = 0; i < 2; i += 1) {
		const d = twoDigits[i];
		const x = dx + i * 52;
		for (const s of SEGMENTS[d]) {
			const p = SEG[s];
			out += `<path d="${p}" transform="translate(${x} 0)"/>`;
		}
	}
	return out;
}

function halftoneDef(id, cell, radius, angle) {
	return `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
      <circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(radius)}" fill="${INK}"/>
    </pattern>`;
}

function polarGrid(cx, cy, r) {
	const rings = [18, 34, 50, 66, 82];
	let out = '';
	for (const rr of rings) out += `<circle cx="${cx}" cy="${cy}" r="${rr}" stroke-width="${rr === 50 ? 1.4 : 1.05}"/>`;
	for (let i = 0; i < 24; i += 1) {
		const a = (i * 360) / 24;
		const [x1, y1] = pt(cx, cy, 84, a);
		const [x2, y2] = pt(cx, cy, i % 6 === 0 ? 96 : 90, a);
		out += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="${i % 6 === 0 ? 1.4 : 0.8}"/>`;
	}
	return out;
}

function weekTicks(week) {
	const cx = 100;
	const cy = 100;
	let out = '';
	for (let i = 0; i <= week; i += 1) {
		const a = -90 + (i * 360) / 25;
		const [x1, y1] = pt(cx, cy, 98, a);
		const [x2, y2] = pt(cx, cy, 104, a);
		out += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="2.2"/>`;
	}
	return out;
}

function registryPlus(week) {
	const a = -90 + (week * 360) / 25;
	const [x, y] = pt(100, 100, 74, a);
	return `<g transform="translate(${x} ${y})"><path d="M-5 0 H5 M0 -5 V5" stroke-width="1" stroke="#fff"/><path d="M-4 0 H4 M0 -4 V4" stroke-width="1.1"/></g>`;
}

function motif(family, id) {
	const cx = 100;
	const cy = 100;
	switch (family) {
		case 'radar':
			return `
      ${polarGrid(cx, cy, 82)}
      <path d="${sector(cx, cy, 80, 30, 202, 332)}" fill="url(#ht-${id})" stroke="none"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="none"/>
      <path d="M100 100 L${pt(cx, cy, 80, -28).join(' ')}" stroke-width="2"/>
      <circle cx="${pt(cx, cy, 78, -28)[0]}" cy="${pt(cx, cy, 78, -28)[1]}" r="4.5" fill="${INK}"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="none"/>`;
		case 'strata': {
			let out = '';
			const bands = [12, 24, 32, 22, 34, 18, 26];
			let y = 18;
			bands.forEach((h, i) => {
				out += `<rect x="12" y="${y}" width="176" height="${h}" fill="${i % 2 === 0 ? `url(#ht-${id})` : 'none'}" stroke="none"/>`;
				out += `<path d="M12 ${y} H188"/>`;
				y += h;
			});
			out += `<path d="M12 18 V182 M188 18 V182"/>`;
			return out;
		}
		case 'lattice': {
			let out = '';
			for (let i = 1; i < 6; i += 1) {
				const v = 12 + i * 29.33;
				out += `<path d="M${f(v)} 12 V188" stroke-width="${i === 3 ? 1.5 : 0.7}"/>`;
				out += `<path d="M12 ${f(v)} H188" stroke-width="${i === 3 ? 1.5 : 0.7}"/>`;
			}
			out += `<rect x="12" y="12" width="176" height="176"/>`;
			for (let i = 1; i < 6; i += 1) {
				for (let j = 1; j < 6; j += 1) {
					const x = 12 + i * 29.33;
					const y = 12 + j * 29.33;
					if ((i + j) % 3 === 0) out += `<circle cx="${f(x)}" cy="${f(y)}" r="3.4" fill="${INK}" stroke="none"/>`;
					else out += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="none"/>`;
				}
			}
			out += `<path d="M12 188 L188 12" stroke-width="0.9" stroke-dasharray="3 4"/>`;
			out += `<path d="M28 44 H${f(12 + 2 * 29.33)} V${f(12 + 4 * 29.33)}" stroke-width="2.4"/>`;
			return out;
		}
		case 'contour': {
			let out = '';
			for (let k = 6; k >= 1; k -= 1) {
				const base = k * 12.5;
				const pts = [];
				const steps = 72;
				for (let i = 0; i < steps; i += 1) {
					const a = (i / steps) * 360;
					const wobble = 7 * Math.sin(rad(a * 3 + k * 34)) + 3.6 * Math.cos(rad(a * 5 - k * 21));
					const r = base + wobble;
					pts.push(pt(cx, cy, r, a));
				}
				const d = `M${pts.map((p) => p.join(' ')).join(' L')} Z`;
				out += `<path d="${d}" fill="${k % 2 === 0 && k < 6 ? `url(#ht-soft-${id})` : 'none'}" stroke-width="${k === 1 ? 1.6 : 1.05}"/>`;
			}
			out += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}" stroke="none"/>`;
			return out;
		}
		case 'waveform': {
			let out = '';
			const ys = [];
			for (let i = 0; i <= 64; i += 1) {
				const x = 10 + (i * 180) / 64;
				const y = 100 + 26 * Math.sin(i * 0.43) + 13 * Math.cos(i * 0.17);
				ys.push([f(x), f(y)]);
			}
			out += `<path d="M${ys.map((p) => p.join(' ')).join(' L')}" stroke-width="1.9"/>`;
			const bars = [34, 58, 24, 76, 46, 88, 30, 64, 40, 72, 22, 54, 36];
			bars.forEach((h, i) => {
				const x = 16 + i * 13.6;
				out += `<rect x="${f(x)}" y="${f(100 - h / 2)}" width="7" height="${h}" fill="${i % 3 === 0 ? `url(#ht-${id})` : INK}" stroke="none" opacity="${i % 3 === 0 ? 0.85 : 0.34}"/>`;
			});
			out += `<path d="M10 100 H190" stroke-width="0.8" stroke-dasharray="2 3"/>`;
			out += `<path d="M10 64 H42 M10 136 H42" stroke-width="2"/>`;
			return out;
		}
	}
	return '';
}

function mark(week) {
	const id = `w${String(week).padStart(2, '0')}`;
	const family = families[week % families.length];
	const two = String(week).padStart(2, '0');
	const dx = 49;
	const cell = 7 + (week % 3);
	const radius = f(1.25 + (week % 4) * 0.22);
	const angle = (week * 11) % 60;
	const halftone = halftoneDef(`ht-${id}`, cell, radius, angle);
	const soft = halftoneDef(`ht-soft-${id}`, cell, radius * 0.62, angle + 30);
	const phase = ((week * 29) % 49) - 24;
	const digits = digitPaths(two, dx);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Plate ${two}">
  <defs>
    ${halftone}
    <filter id="rough-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${week + 3}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <clipPath id="disc-${id}"><circle cx="100" cy="100" r="86"/></clipPath>
  </defs>
  <g fill="none" stroke="${INK}" stroke-linecap="square" stroke-linejoin="miter">
    <g clip-path="url(#disc-${id})" filter="url(#rough-${id})">
      ${motif(family, id)}
    </g>
    <circle cx="100" cy="100" r="86" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="92" stroke-width="0.7" stroke-dasharray="1 3"/>
    ${weekTicks(week)}
    ${registryPlus(week)}
    <g stroke-width="13" stroke="#fff">${digits}</g>
    <g stroke-width="6.4" stroke="${INK}">${digits}</g>
    <g stroke-width="1.1">
      <path d="M14 14 H38 M14 14 V38"/>
      <path d="M186 186 H162 M186 186 V162"/>
    </g>
  </g>
</svg>
`;
}

await mkdir(OUT, { recursive: true });
for (let week = 0; week < 25; week += 1) {
	const name = `w${String(week).padStart(2, '0')}.svg`;
	await writeFile(join(OUT, name), mark(week), 'utf8');
}
process.stdout.write(`Generated 25 marks in ${OUT}\n`);
