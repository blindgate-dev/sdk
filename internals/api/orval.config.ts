import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: {
      target: process.env.OPENAPI_URL ?? 'https://api.blindgate.dev/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated',
      schemas: './src/generated/model',
      client: 'fetch',
      allParamsOptional: true,
      clean: true,
      indexFiles: true,
      biome: true,
      override: {
        mutator: {
          path: './src/client/http-client.ts',
          name: 'httpClient',
        },
        useTypeOverInterfaces: true,
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
})
