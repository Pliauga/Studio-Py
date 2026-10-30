/**
 * The poster's ink. The landing terminal writes it from the program it ran;
 * the halftone shader reads it as dot radius. `null` is a plate nobody has run
 * code against: it stays exactly as printed.
 */
class Plate {
	density = $state<number | null>(null);
	/** Counts successful runs; each one jams the halftone screen off register. */
	jams = $state(0);

	jam(): void {
		this.jams += 1;
	}

	set(value: number): void {
		this.density = Math.min(1, Math.max(0, value));
	}

	clear(): void {
		this.density = null;
	}
}

export const plate = new Plate();
