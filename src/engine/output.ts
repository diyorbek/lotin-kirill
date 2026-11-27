/**
 * The output of a transliteration, written from left to right over its source,
 * that follows offsets into the source (cuts) to where they land in the output.
 *
 * A stretch of the source is written either as it is, where every cut keeps its
 * place, or as one replacement: a cut at its start stays before the replacement,
 * a cut inside goes after it, so the replacement stays with the piece where its
 * source starts (s|h → ш|). The writer can place the cuts inside a replacement
 * itself, e.g. from a transliteration of that stretch.
 */
const NO_CUTS: readonly number[] = [];

export class Output {
  private chunks: string[] = []; // joined once at the end: a growing string would be a deep rope
  private length = 0;
  private at = 0; // how much of the source is written
  private placed: number[] = [];

  constructor(
    private source: string,
    private cuts: readonly number[],
  ) {}

  /** The cuts after the current position and before `end`, counted from the current position. */
  cutsBefore(end: number): readonly number[] {
    const next = this.cuts[this.placed.length]; // undefined once all are placed

    // Most words: nothing to look for, nothing to allocate
    if (next === undefined || next >= end) {
      return NO_CUTS;
    }

    const found: number[] = [];

    for (
      let index = this.placed.length;
      index < this.cuts.length && this.cuts[index] < end;
      index++
    ) {
      if (this.cuts[index] > this.at) {
        found.push(this.cuts[index] - this.at);
      }
    }

    return found;
  }

  /** Writes the source up to `end` as it is. */
  keep(end: number): void {
    const start = this.at;

    while (
      this.placed.length < this.cuts.length &&
      this.cuts[this.placed.length] < end
    ) {
      const cut = this.cuts[this.placed.length];

      this.placed.push(this.length + Math.max(0, cut - start));
    }

    this.write(this.source.slice(start, end));
    this.at = end;
  }

  /**
   * Writes `replacement` for the source up to `end`. `inside` places the cuts
   * that `cutsBefore(end)` gives, in the replacement; without it they go after it.
   */
  replace(end: number, replacement: string, inside?: readonly number[]): void {
    let index = 0;

    while (
      this.placed.length < this.cuts.length &&
      this.cuts[this.placed.length] < end
    ) {
      const cut = this.cuts[this.placed.length];
      let offset = replacement.length;

      if (cut <= this.at) {
        offset = 0;
      } else if (inside) {
        offset = inside[index++];
      }

      this.placed.push(this.length + offset);
    }

    this.write(replacement);
    this.at = end;
  }

  /** The rest of the source as it is, then the output and where the cuts landed. */
  finish(): [text: string, cuts: number[]] {
    this.keep(this.source.length);

    while (this.placed.length < this.cuts.length) {
      this.placed.push(this.length);
    }

    return [this.chunks.join(''), this.placed];
  }

  private write(text: string) {
    if (text) {
      this.chunks.push(text);
      this.length += text.length;
    }
  }
}
