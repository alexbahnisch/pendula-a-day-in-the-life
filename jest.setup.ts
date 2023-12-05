import {http, HttpResponse} from 'msw'
import {SetupServer, setupServer} from 'msw/node'
import {logJsonPostHandler} from "./src/app.mock";

export type Method = keyof typeof http

export function mockClientServerError(server: SetupServer, path: string, method: Method, status: number) {
    return server.use(
        http[method](path, () => new HttpResponse(null, { status }))
    )
}

export function mockClientServerErrorOnce(server: SetupServer, path: string, method: Method, status: number) {
    return server.use(
        http[method](path, () => new HttpResponse(null, { status }), { once: true })
    )
}

export function mockNetworkError(server: SetupServer, path: string, method: Method) {
    return server.use(
        http[method](path, () => HttpResponse.error())
    )
}

export function mockNetworkErrorOnce(server: SetupServer, path: string, method: Method) {
    return server.use(
        http[method](path, () => HttpResponse.error(), { once: true })
    )
}

export const server: SetupServer = setupServer(
    logJsonPostHandler
)

beforeAll(() => {
    server.listen({
        onUnhandledRequest: 'bypass'
    })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
