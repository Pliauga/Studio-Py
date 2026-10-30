import { BlendFunction, Effect } from 'postprocessing';
import { Color, Uniform } from 'three';

// 1-bit ordered dither + film grain. Darkness (0 = paper, 1 = ink) is the pixel's
// luminance between the two palette colours, so a sheet of paper stays pure paper
// and everything else is printed as an 8x8 Bayer screen of ink dots.
const FRAGMENT = /* glsl */ `
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uCell;
uniform float uGrain;
uniform float uStep;
uniform float uTransparent;

float bayer2(vec2 a) {
	a = floor(a);
	return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
	return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
	return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
	float lum = dot(pow(max(inputColor.rgb, vec3(0.0)), vec3(1.0 / 2.2)), LUMA);
	float paperLum = dot(pow(uPaper, vec3(1.0 / 2.2)), LUMA);
	float inkLum = dot(pow(uInk, vec3(1.0 / 2.2)), LUMA);
	float darkness = inputColor.a * clamp((lum - paperLum) / (inkLum - paperLum), 0.0, 1.0);

	float threshold = bayer8(floor(gl_FragCoord.xy / uCell)) + 0.5 / 64.0;
	float ink = step(threshold, darkness);
	float grain = (hash(gl_FragCoord.xy + uStep) - 0.5) * 2.0 * uGrain;

	if (uTransparent > 0.5) {
		outputColor = vec4((uInk + grain) * ink, ink);
	} else {
		outputColor = vec4(mix(uPaper, uInk, ink) + grain, 1.0);
	}
}
`;

export type BrutalistOptions = {
	paper: string;
	ink: string;
	/** Paper pixels become transparent, so the page shows through instead of a flat sheet. */
	transparent?: boolean;
	/** Peak grain amplitude as a fraction of full range. */
	grain?: number;
	/** Device pixels per dither cell. */
	cell?: number;
};

export class BrutalistEffect extends Effect {
	private readonly paper: Uniform<Color>;
	private readonly ink: Uniform<Color>;
	private readonly cell: Uniform<number>;
	private readonly step: Uniform<number>;
	private clock = 0;

	constructor({ paper, ink, transparent = false, grain = 0.01, cell = 1 }: BrutalistOptions) {
		const paperUniform = new Uniform(new Color(paper));
		const inkUniform = new Uniform(new Color(ink));
		const cellUniform = new Uniform(cell);
		const stepUniform = new Uniform(0);

		super('BrutalistEffect', FRAGMENT, {
			blendFunction: BlendFunction.SET,
			uniforms: new Map<string, Uniform>([
				['uPaper', paperUniform],
				['uInk', inkUniform],
				['uCell', cellUniform],
				['uGrain', new Uniform(grain)],
				['uStep', stepUniform],
				['uTransparent', new Uniform(transparent ? 1 : 0)]
			])
		});

		this.paper = paperUniform;
		this.ink = inkUniform;
		this.cell = cellUniform;
		this.step = stepUniform;
	}

	setPalette(paper: string, ink: string): void {
		this.paper.value.set(paper);
		this.ink.value.set(ink);
	}

	setCell(pixels: number): void {
		this.cell.value = Math.max(1, Math.round(pixels));
	}

	/** The grain re-rolls at 12 fps: a printed sheet that flickers, not a video noise. */
	override update(_renderer: unknown, _inputBuffer: unknown, deltaTime = 0): void {
		this.clock += deltaTime;
		this.step.value = Math.floor(this.clock * 12) * 17.31;
	}
}
