export abstract class WaitFotTokenPayloadTemplate {
  abstract process(inputJson: string): Record<string, unknown>;

  protected isPathKey(path: string): boolean {
    return path.endsWith('.$');
  }

  protected isContextObjectPath(path: string): boolean {
    return path.startsWith('$$.');
  }
}
