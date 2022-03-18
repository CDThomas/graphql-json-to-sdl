# graphql-json-to-sdl

[![Version](https://img.shields.io/npm/v/graphql-json-to-sdl.svg)](https://npmjs.org/package/graphql-json-to-sdl)
[![Codecov](https://codecov.io/gh/CDThomas/graphql-json-to-sdl/branch/master/graph/badge.svg)](https://codecov.io/gh/CDThomas/graphql-json-to-sdl)
[![Downloads/week](https://img.shields.io/npm/dw/graphql-json-to-sdl.svg)](https://npmjs.org/package/graphql-json-to-sdl)
[![License](https://img.shields.io/npm/l/graphql-json-to-sdl.svg)](https://github.com/CDThomas/graphql-json-to-sdl/blob/master/package.json)

A command line utility for converting a JSON GraphQL schema to GraphQL SDL.

This is useful when you only have a JSON GraphQL schema (e.g. from a code-first GraphQL library that can only produce schemas as `.json` files) but you need an SDL schema (i.e. `.graphql` file) for other tooling.

Fields from the JSON schema are sorted before writing the SDL file. This allows for consistent SDL output even when using a GraphQL library that produces JSON schemas with nondeterministic field order.

## Usage

```bash
$ graphql-json-to-sdl SRC OUT
```

### Arguments:

- SRC: The JSON GraphQL schema to convert
- OUT: The output file

### Options:

- `-h`, `--help`: show CLI help
- `-v`, `--version`: show CLI version

### Example:

```bash
$ graphql-json-to-sdl ./schema.json ./schema.graphql
```

## Developing

Install dependencies with:
```sh
$ yarn install
```

To run tests:
```sh
$ yarn test
```

You can also run the CLI in dev mode. For example:
```sh
$ ./bin/run --help
```
