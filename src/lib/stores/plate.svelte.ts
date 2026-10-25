/**
 * The poster's ink. The landing terminal writes it from the program it ran;
 * the plate reads it as `--plate-density`. `null` is a plate nobody has run
 * code against: it stays exactly as printed.
 */
class Plate {
	density = $state<number | null>(null);

	set(value: number): void {
		this.density = Math.min(1, Math.max(0, value));
	}

	clear(): void {
		this.density = null;
	}
}

export const plate = new Plate();
