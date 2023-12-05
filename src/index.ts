#!/usr/bin/env -S npx ts-node
import express from 'express';
import multer from 'multer';
import {error, table} from "./utils";
import {parse} from "papaparse";
import {Persons} from "./types";
import type {Person, Result} from "./types";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || '7000';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/', (req, res) => {
    res.send(`
<form action="/csv" method="post" enctype="multipart/form-data">
  <input type="file" name="csv-file" accept=".csv">
  <button type="submit">Upload CSV</button>
</form>
`);
});

app.post('/csv', upload.single('csv-file'), async (req, res) => {
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
        res.status(415)
        return req.accepts('text/html')
            ? res.type('text/html').send(error('No file found!'))
            : res.json({error: 'No file found!'})
    }

    if (!req.file) {
        res.status(400)
        return req.accepts('text/html')
            ? res.type('text/html').send(error('Missing .csv file!'))
            : res.json({error: 'Missing .csv file!'})
    }

    const csvResult = parse(req.file.buffer.toString('utf-8'), {header: true, skipEmptyLines: true})
    if (csvResult.errors.length) {
        res.status(400)
        return req.accepts('text/html')
            ? res.type('text/html').send(error('Malformed .csv file!'))
            : res.json({error: 'Malformed .csv file!'})
    }

    const castResult = Persons.safeParse(csvResult.data)
    if (!castResult.success) {
        res.status(400)
        return req.accepts('text/html')
            ? res.type('text/html').send(error('Malformed .csv data!'))
            : res.json({error: 'Malformed .csv data!'})
    }

    const results: Result[] = await Promise.all(castResult.data.map(async (person: Person): Promise<Result> => {
        try {
            const response = await fetch('http://localhost:7000/log/json/', {
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
    return req.accepts('text/html') ? res.type('text/html').send(table(results)) : res.json({ results });
});

app.post('/log/json', (req, res) => {
    let body = req.body

    if (!req.is('application/json')) {
        body = JSON.parse(req.body)
    }

    console.log(`[POST] /log/json ${JSON.stringify(body, undefined, 2)}`)

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
