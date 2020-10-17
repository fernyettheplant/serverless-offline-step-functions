export abstract class PayloadTemplate {
  public abstract process(inputJson: string): Record<string, unknown>;
  protected abstract processPathKey(key: string, value: unknown, inputJson: string): Record<string, unknown>;

  protected isPathKey(path: string): boolean {
    return path.endsWith('.$');
  }

  protected isContextObjectPath(path: string): boolean {
    return path.startsWith('$$.');
  }

  protected processPayloadTemplateEntry(key: string, value: unknown, inputJson: string): Record<string, unknown> {
    if (this.isPathKey(key)) {
      return this.processPathKey(key, value, inputJson);
    }

    if (typeof value === 'object' && value !== null) {
      return {
        [key]: this.processPayloadTemplate(inputJson, value as Record<string, unknown>),
      };
    }

    return { [key]: value };
  }

  protected processPayloadTemplate(inputJson: string, payload?: Record<string, unknown>): any {
    if (!payload) {
      return {};
    }

    let output = {};
    Object.entries(payload).forEach(([key, value]: [string, unknown]) => {
      output = {
        ...output,
        ...this.processPayloadTemplateEntry(key, value, inputJson),
      };
    });
    return output;
  }
}
