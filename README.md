# Serverless Offline Step Functions **(STATUS: ALPHA)**

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
![npm](https://img.shields.io/npm/v/@fernthedev/serverless-offline-step-functions)
![node-lts](https://img.shields.io/node/v-lts/@fernthedev/serverless-offline-step-functions)
![GitHub](https://img.shields.io/github/license/jefer590/serverless-offline-step-functions)
![GitHub issues](https://img.shields.io/github/issues-raw/jefer590/serverless-offline-step-functions)
![GitHub pull requests](https://img.shields.io/github/issues-pr/jefer590/serverless-offline-step-functions)

Serverless Offline Plugin to Support Step Functions for Local Development.

**Features**:

- Fully Written in TypeScript
- Promise based (no process spawn)

## Sponsor

If the plugin is being useful in your company and/or project and want to keep the development active, consider buying me a coffee 🙂... coffee is the thing that makes me the most happy person in the world and I'd appreciate the sponsorship.

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y42C4E9)

## Requirements

- [serverless](https://github.com/serverless/serverless)
- [serverless-offline](https://github.com/dherault/serverless-offline)
- [serverless-step-functions plugin](https://github.com/serverless-operations/serverless-step-functions)
- [serverless-webpack (optional)](https://github.com/serverless-heaven/serverless-webpack)

## Installation

```shell
$ npm i -D @fernthedev/serverless-offline-step-functions

# or

$ yarn add -D @fernthedev/serverless-offline-step-functions
```

## Options

The plugin contain a couple of options to configure in `custom`

```yml
custom:
  '@fernthedev/serverless-offline-step-functions':
    port: 8014
    enabled: true
```

- `port`: Port of the Step Functions API Simulator (Default: 8014)
- `enabled`: Enabled Step Function API Simulator (Default: true)

## Using it with Webpack

If your project uses `serverless-webpack` to compile/transpile your serverless application. **Make sure is defined in your plugins before this plugin and `serverless-offline`**

### Example

```yml
plugins:
  - serverless-webpack # Defined Before
  - serverless-step-functions
  - '@fernthedev/serverless-offline-step-functions'
  - serverless-offline
```

## State Types Supported

| States         | Notes                                                                        |
| -------------- | ---------------------------------------------------------------------------- |
| **_Task_**     | Retry/Catch now supported!, `Timeout` and `Heartbeat` are not supported yet. |
| **_Choice_**   | ✅                                                                           |
| **_Wait_**     | ✅                                                                           |
| **_Parallel_** | Not Supported at all yet.                                                    |
| **_Pass_**     | ✅                                                                           |
| **_Fail_**     | ✅                                                                           |
| **_Succeed_**  | ✅                                                                           |
| **_Map_**      | Not Supported at all yet.                                                    |

## Credits and inspiration

The plugin began as a fork of [flocasts/serverless-offline-step-functions](https://github.com/flocasts/serverless-offline-step-functions) for a fix. Then I decided to do a full rewrite of it 😀

## License

[MIT](./LICENSE)

## How to Contribute

Thank you for your interest on contributing. There's a tons of ways that you can contribute!

- If you see that something is not right, open an issue!
- If you know exactly what is happening, open a PR!
- Want to improve the docs? Open a PR!
- Want to improve the code? Open a PR!

Please follow both PR and Issues template for contribution. **Any Open Issue/PR that does not follow the templates will be closed**
