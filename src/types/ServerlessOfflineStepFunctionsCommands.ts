export type CLIOptions = Record<string, unknown>;

export type ServerlessOfflineStepFunctionsCommands = CLIOptions & {
  '@fernthedev/serverless-offline-step-functions': {
    options: {
      port: {
        usage: string;
        required: false;
      };
    };
  };
};
