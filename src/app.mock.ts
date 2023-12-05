import {http, HttpResponse} from "msw";
import {NEXT_ACTION_PATH} from "./app";

export const logJsonPostHandler = http.post(NEXT_ACTION_PATH, () => {
    return new HttpResponse(null, {
        status: 204,
    })
})
