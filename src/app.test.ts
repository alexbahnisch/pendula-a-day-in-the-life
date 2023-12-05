import {join} from 'path';
import request from 'supertest';
import {app, NEXT_ACTION_PATH} from './app';
import {parse} from "papaparse";
import {readFileSync} from "fs";
import {Persons} from "./types";
import type {Result} from "./types";
import {
    mockClientServerError,
    mockClientServerErrorOnce,
    mockNetworkError,
    mockNetworkErrorOnce,
    server
} from "../jest.setup";

const parseResult = parse(readFileSync(join(__dirname, '..', '/data/trigger.csv')).toString('utf-8'), { header: true, skipEmptyLines: true })
const persons = Persons.parse(parseResult.data)
const resultAllSuccess = persons.map((person): Result => ({ ...person, Success: true }))
const resultFirstFailure = persons.map((person, index): Result => ({ ...person, Success: index > 0 }))
const resultAllFailure = persons.map((person): Result => ({ ...person, Success: false }))

describe('POST /csv', () => {
    it('accepted all successful', async () => {
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger.csv'))

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ results: resultAllSuccess });
    });

    it('accepted first failed due to bad request', async () => {
        mockClientServerErrorOnce(server, NEXT_ACTION_PATH, 'post', 400)
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger.csv'))

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ results: resultFirstFailure });
    });

    it('accepted all failed due to bad request', async () => {
        mockClientServerError(server, NEXT_ACTION_PATH, 'post', 400)
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger.csv'))

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ results: resultAllFailure });
    });

    it('accepted first failed due to network error', async () => {
        mockNetworkErrorOnce(server, NEXT_ACTION_PATH, 'post')
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger.csv'))

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ results: resultFirstFailure });
    });

    it('accepted all failed due to network error', async () => {
        mockNetworkError(server, NEXT_ACTION_PATH, 'post')
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger.csv'))

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ results: resultAllFailure });
    });

    it('missing .csv file', async () => {
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'missing .csv file'});
    });

    it('malformed .csv file', async () => {
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger_csv_error.csv'))

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'malformed .csv file'});
    });

    it('malformed .csv data', async () => {
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger_data_error.csv'))

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'malformed .csv data'});
    });

    it('empty .csv data', async () => {
        const response = await request(app)
            .post('/csv')
            .set('accept', 'application/json')
            .set('content-type', 'multipart/form-data')
            .attach('csv-file', join(__dirname, '..', '/data/trigger_empty.csv'))

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'empty .csv data'});
    });
});
