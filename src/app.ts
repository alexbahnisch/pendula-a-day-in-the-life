import express from 'express';
import multer from 'multer';
import {parse} from "papaparse";
import {sendError, renderTable, renderForm} from "./utils";
import {Persons} from "./types";
import type {Person, Result} from "./types";

export const app = express();
export const NEXT_ACTION_PATH = `http://localhost:${process.env.PORT || '7000'}/log/json`

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

app.use(express.json());
app.use(express.text());

app.get('/', (req, res) => {
    res.send(renderForm());
});

app.post('/csv', upload.single('csv-file'), async (req, res) => {
    if (!req.file) {
        return sendError(req, res, 400, 'missing .csv file')
    }

    const csvResult = parse(req.file.buffer.toString('utf-8'), {header: true, skipEmptyLines: true})
    if (csvResult.errors.length) {
        // TODO: more granular errors
        return sendError(req, res, 400, 'malformed .csv file')
    }

    const castResult = Persons.safeParse(csvResult.data)
    if (!castResult.success) {
        // TODO: more granular errors
        return sendError(req, res, 400, 'malformed .csv data')
    }

    if (!castResult.data.length) {
        return sendError(req, res, 400, 'empty .csv data')
    }

    const results: Result[] = await Promise.all(castResult.data.map(async (person: Person): Promise<Result> => {
        try {
            const response = await fetch(NEXT_ACTION_PATH, {
                body: JSON.stringify(person),
                method: 'POST',
            })

            if (response.ok) {
                return {
                    ...person,
                    Success: true,
                }
            }

            return {
                ...person,
                Success: false,
            }
        } catch (err) {
            return {
                ...person,
                Success: false,
            }
        }
    }))

    res.status(202)
    return req.accepts('text/html') ? res.type('text/html').send(renderTable(results)) : res.json({ results });
});

app.post('/log/json', (req, res) => {
    let body = req.body
    console.log('poo')

    if (!req.is('application/json')) {
        body = JSON.parse(req.body)
    }

    console.log(`[POST] /log/json ${JSON.stringify(body, undefined, 2)}`)

    res.status(204).send();
});
