import { http, HttpResponse } from "msw";
import { EXTERNAL_ENDPOINT } from "./app";

export const logJsonPostHandler = http.post(EXTERNAL_ENDPOINT, () => {
  return new HttpResponse(null, {
    status: 204,
  });
});
