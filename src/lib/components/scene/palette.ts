// The sandbox prints in one ink on one sheet. Every scene takes its colours from
// here so the 3D stage and the brutalist chrome around it cannot drift apart.
/** Alabaster paper: the sheet the stage is drawn on, and the colour of an outline. */
export const PAPER = '#f8f7f2';
/** Solid black: every block, rail, belt and bin. Objects are mass, not surface. */
export const INK = '#000000';
/** A rule held one stop back from ink, so the floor reads as graph paper. */
export const GRAPHITE = '#333333';
/** The only accent: an active node, a highlighted data point, a jammed mechanism. */
export const PHOSPHOR = '#33ff00';
