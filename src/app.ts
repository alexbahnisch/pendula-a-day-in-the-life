import express from "express";
import multer from "multer";
import { parse } from "papaparse";
import { sendError, renderTable, renderForm } from "./utils";
import {GoogleSheetsAction, Persons} from "./types";
import type { Person, Result } from "./types";

export const app = express();

const logJsonPath = "/log/json";
export const EXTERNAL_ENDPOINT = `http://localhost:${process.env.PORT || "7000"}${logJsonPath}`;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.text());

app.get("/", (req, res) => {
  res.send(renderForm());
});

// Question 1. endpoint
app.post("/csv", upload.single("csv-file"), async (req, res) => {
  if (!req.file) {
    return sendError(req, res, 400, "missing .csv file");
  }

  const csvResult = parse(req.file.buffer.toString("utf-8"), {
    header: true,
    skipEmptyLines: true,
  });
  if (csvResult.errors.length) {
    // TODO: more granular errors
    return sendError(req, res, 400, "malformed .csv file");
  }

  const castResult = Persons.safeParse(csvResult.data);
  if (!castResult.success) {
    // TODO: more granular errors
    return sendError(req, res, 400, "malformed .csv data");
  }

  if (!castResult.data.length) {
    return sendError(req, res, 400, "empty .csv data");
  }

  const results: Result[] = await Promise.all(
    castResult.data.map(async (person: Person): Promise<Result> => {
      try {
        const response = await fetch(EXTERNAL_ENDPOINT, {
          body: JSON.stringify(person),
          method: "POST",
        });

        if (response.ok) {
          return {
            ...person,
            Accepted: true,
          };
        }

        return {
          ...person,
          Accepted: false,
        };
      } catch (err) {
        return {
          ...person,
          Accepted: false,
        };
      }
    }),
  );

  res.status(202);
  return req.accepts("text/html") ? res.type("text/html").send(renderTable(results)) : res.json({ results });
});

// Question 1. "external endpoint" for posting response
app.post(logJsonPath, (req, res) => {
  let body = req.body;

  if (!req.is("application/json")) {
    body = JSON.parse(req.body);
  }

  console.log(`POST ${logJsonPath} ${JSON.stringify(body, undefined, 2)}`);

  res.status(204).send();
});

// Question 2.
app.post("/google-sheets-action", async (req, res) => {
  let body = req.body;

  if (!req.is("application/json")) {
    body = JSON.parse(req.body);
  }

  const result = GoogleSheetsAction.safeParse(body);
  if (!result.success) {
    // TODO: more granular errors
    return res.status(400).json({ error: 'bad request' });
  }

  // TODO: interact with Google API to create and add content the spreadsheet

  return res.status(200).json({ ID: -1 })
});
