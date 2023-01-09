# Deno CloudSpec AWS CDK Proof of Concept

This is a proof of concept for a [Deno](https://deno.land/) based cloudspec project. This will deploy an AWS CDK stack as part of the test and make expectations on the stack outputs. It's using the Deno [testing](https://deno.land/manual@v1.29.2/basics/testing) capabilities.

Nb: As stated above, that's a POC and nothing I'd recommend using at the moment.

## Motivation

Trying to find a streamlined experience for end2end testing, without having to deal with cumbersome test setup. Essentially aiming for a single command which works without much (any?) config. Deno became quite an attractive contender [recently](https://deno.com/blog/v1.28) by adding direct support for NPM packges.

While that's still focused on Typescript as a language, I could imagine this would be an acceptable workflow for other [jsii](https://github.com/aws/jsii) languages as well, since it's pretty much effortless and zero config. But that's something for another experiment.

## Prerequisites

You'll need to have Deno [installed](https://deno.land/manual@v1.29.2/getting_started/installation)

## Examples

### Inline Deno

This [test](./examples/inline/awscdk.test.ts) demonstrates that it's possible to use AWS CDK inline in Deno tests.

```
deno test --no-check --allow-all ./examples/inline
```

### Embedded into Node Project

This [test](./examples/node/awscdk.test.ts) demonstrates that it's possible to use Deno inside an Typescript / Node AWS CDK application. The way to make it work is to use an [import_map](./examples/node/import_map.json) to map the NPM packages. Potentially, this import map could be auto generated based on a package.json file to allow seamless test runs alongside an otherwise node based project.

```
deno test --no-check --allow-all --import-map ./examples/node/import_map.json ./examples/node
```
