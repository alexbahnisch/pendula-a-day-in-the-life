import type {Result} from "./types.ts";

export function error(message: string): string {
    return `<div style="color: red;">${message}</div>`
}

export function table(results: Result[]): string {
    return `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Number</th>
      <th>Success</th>
    </tr>
  </thead>
  <tbody>
    ${results.map(({Name, Number, Success}) => (`
    <tr>
      <td>${Name}</td>
      <td>${Number}</td>
      <td>${Success}</td>
    </tr>
`)).join('')}
  </tbody>
</table>    
`
}
