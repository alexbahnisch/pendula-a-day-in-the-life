import type { Result } from "./types";
import type { Request, Response } from "express";

export function renderForm(): string {
  return `
<form action="/csv" method="post" enctype="multipart/form-data">
  <input type="file" name="csv-file" accept=".csv">
  <button type="submit">Upload CSV</button>
</form>
`;
}

export function renderTable(results: Result[]): string {
  return `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Number</th>
      <th>Accepted</th>
    </tr>
  </thead>
  <tbody>
    ${results
      .map(
        ({ Name, Number, Accepted }) => `
    <tr>
      <td>${Name}</td>
      <td>${Number}</td>
      <td>${Accepted}</td>
    </tr>
`,
      )
      .join("")}
  </tbody>
</table>    
`;
}

export function sendError(req: Request, res: Response, status: number, message: string) {
  res.status(status);
  return req.accepts("text/html")
    ? res.type("text/html").send(`<div style="color: maroon;">${message}</div>`)
    : res.json({ error: message });
}
