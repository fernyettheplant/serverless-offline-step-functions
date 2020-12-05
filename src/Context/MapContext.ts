export class MapContext {
  constructor(private readonly index: number, private readonly value: string) {}

  public static create(index: number, value: string): MapContext {
    return new MapContext(index, value);
  }

  get Item(): { Index: number; Value: string } {
    return {
      Index: this.index,
      Value: this.value,
    };
  }
}
