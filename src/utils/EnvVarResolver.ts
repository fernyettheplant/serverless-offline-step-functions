export class EnvVarResolver {
  private static INSTANCE: EnvVarResolver;
  private globalEnvironment: Record<string, string> | undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): EnvVarResolver {
    if (!this.INSTANCE) {
      this.INSTANCE = new EnvVarResolver();
    }

    return this.INSTANCE;
  }

  public set global(globalEnvironment: Record<string, string> | undefined) {
    this.globalEnvironment = globalEnvironment;
  }

  public injectGlobalEnvVars(): void {
    if (this.globalEnvironment) {
      Object.entries(this.globalEnvironment).forEach(([key, value]) => {
        process.env[key] = value;
      });
    }
  }

  public injectEnvVarsLambdaSpecific(lambdaEnv: Record<string, string> | undefined): void {
    if (!lambdaEnv) {
      return;
    }

    Object.entries(lambdaEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  public removeEnvVarsLambdaSpecific(lambdaEnv: Record<string, string> | undefined): void {
    if (!lambdaEnv) {
      return;
    }

    Object.keys(lambdaEnv).forEach((key) => {
      if (this.globalEnvironment && key in this.globalEnvironment) {
        process.env[key] = this.globalEnvironment[key];
      } else {
        delete process.env[key];
      }
    });
  }
}
