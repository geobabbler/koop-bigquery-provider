# Koop BigQuery Provider

[![Build Status](https://travis-ci.org/geobabbler/koop-bigquery-provider.svg?branch=master)](https://travis-ci.org/koopjs/koop-provider-example) [![Greenkeeper badge](https://badges.greenkeeper.io/koopjs/koop-provider-example.svg)](https://greenkeeper.io/)



## Getting started

1. Open `config/default.json` with any configurable parameters
1. Open `src/index.js` and change `provider.name` to a unique name
1. Open `src/model.js` and implement `getData` to call your provider and return GeoJSON
1. Install dependencies `npm install`
1. Run a local dev server `npm start`
1. Add tests to `test/`

## Koop provider file structure

| File | | Description |
| --- | --- | --- |
| `src/index.js` | Mandatory | Configures provider for usage by Koop |
| `src/model.js` | Mandatory | Translates remote API to GeoJSON |
| `src/routes.js` | Optional | Specifies additional routes to be handled by this provider |
| `src/controller.js` | Optional | Handles additional routes specified in `routes.js` |
| `test/model-test.js` | Optional | tests the `getData` function on the model |
| `test/fixtures/input.json` | Optional | a sample of the raw input from the 3rd party API |
| `config/default.json` | Optional | used for advanced configuration, usually API keys. |


## Test it out
Run server:
- `npm install`
- `npm start`

Example API Query:
- `curl http://localhost:8080/bigquery/rest/services/${dataset}.{table}/FeatureServer/0/query`

Tests:
- `npm test`

### Development output callstack logs

During development you can output error callstack with

- `NODE_ENV=test npm start`

## Publish to npm

- run `npm init` and update the fields
  - Choose a name like `koop-provider-foo`
- run `npm publish`
