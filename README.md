# A day in the life of expert services

## Prerequisites

- Node (^20.10)
- NPM (^10.2.4)

## Project Structure

```
├── data                            # csv files use to test POST /csv endpoint
│   ├── trigger_success.csv             # upload to trigger success response
│   ├── trigger_csv_error.csv           # upload to trigger 'malforned .csv file' response
│   ├── trigger_data_error.csv          # upload to trigger 'malforned .csv data' response
│   └── trigger_empty_error.csv         # upload to trigger 'empty .csv data' response
└── src                             # source code, mocks and tests
```

## Getting started

To install dependencies:

```bash
npm install
```

To run server:

```bash
npm start
```

or, to run server in watch mode:

```bash
npm run watch
```

The server will then be available at http://localhost:7000, or whatever port is specified by the `PORT`
environment variable. Example .csv files for upload are available in the `./data` directory. On a 
successful csv upload the json blob of the triggered persons will be printed to stdout.

To run tests:

```bash
npm test
```
