import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from './health.js';

function createResponse(status, body = '') {
    return {
        ok: status >= 200 && status < 300,
        status,
        async text() {
            return body;
        },
    };
}

test('health endpoint returns ok when the backend is healthy', async () => {
    const originalFetch = globalThis.fetch;
    const originalBackendUrl = process.env.BACKEND_URL;
    process.env.BACKEND_URL = 'https://backend.example.com';
    globalThis.fetch = async (url, options) => {
        assert.equal(url, 'https://backend.example.com/health/');
        assert.equal(options.method, 'GET');
        return createResponse(200);
    };

    const response = await handler({ method: 'GET' });

    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
    globalThis.fetch = originalFetch;
    process.env.BACKEND_URL = originalBackendUrl;
});

test('health endpoint reports backend failures', async () => {
    const originalFetch = globalThis.fetch;
    const originalBackendUrl = process.env.BACKEND_URL;
    process.env.BACKEND_URL = 'https://backend.example.com/';
    globalThis.fetch = async () => createResponse(503);

    const response = await handler({ method: 'GET' });

    assert.equal(response.status, 503);
    assert.deepEqual(JSON.parse(response.body), { status: 'error' });
    globalThis.fetch = originalFetch;
    process.env.BACKEND_URL = originalBackendUrl;
});