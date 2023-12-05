import { join } from "path";
import request from "supertest";
import { app, EXTERNAL_ENDPOINT } from "./app";
import { parse } from "papaparse";
import { readFileSync } from "fs";
import { Persons } from "./types";
import type { Result } from "./types";
import {
  mockClientServerError,
  mockClientServerErrorOnce,
  mockNetworkError,
  mockNetworkErrorOnce,
  server,
} from "../jest.setup";

const parseResult = parse(readFileSync(join(__dirname, "..", "/data/trigger_success.csv")).toString("utf-8"), {
  header: true,
  skipEmptyLines: true,
});
const persons = Persons.parse(parseResult.data);
const resultAllSuccess = persons.map((person): Result => ({ ...person, Accepted: true }));
const resultPartialFailure = persons.map((person, index): Result => ({ ...person, Accepted: index > 0 }));
const resultAllFailure = persons.map((person): Result => ({ ...person, Accepted: false }));

describe("POST /csv", () => {
  test("success, all accepted", async () => {
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_success.csv"));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ results: resultAllSuccess });
  });

  test("success, partial accepted due to bad request", async () => {
    mockClientServerErrorOnce(server, EXTERNAL_ENDPOINT, "post", 400);
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_success.csv"));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ results: resultPartialFailure });
  });

  test("success, none accepted due to bad requests", async () => {
    mockClientServerError(server, EXTERNAL_ENDPOINT, "post", 400);
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_success.csv"));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ results: resultAllFailure });
  });

  test("success, partial accepted due to network error", async () => {
    mockNetworkErrorOnce(server, EXTERNAL_ENDPOINT, "post");
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_success.csv"));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ results: resultPartialFailure });
  });

  test("success, none accepted due to network errors", async () => {
    mockNetworkError(server, EXTERNAL_ENDPOINT, "post");
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_success.csv"));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ results: resultAllFailure });
  });

  test("missing .csv file", async () => {
    const response = await request(app).post("/csv").set("accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "missing .csv file" });
  });

  test("malformed .csv file", async () => {
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_csv_error.csv"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "malformed .csv file" });
  });

  test("malformed .csv data", async () => {
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_data_error.csv"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "malformed .csv data" });
  });

  test("empty .csv data", async () => {
    const response = await request(app)
      .post("/csv")
      .set("accept", "application/json")
      .set("content-type", "multipart/form-data")
      .attach("csv-file", join(__dirname, "..", "/data/trigger_empty_error.csv"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "empty .csv data" });
  });
});
