const getBackendHealthUrl = () => {
    const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL;

    if (!backendUrl) {
        throw new Error('BACKEND_URL is not configured');
    }

    return `${backendUrl.replace(/\/+$/, '')}/health/`;
};

export async function handler(request) {
    if (request.method !== 'GET') {
        return {
            status: 405,
            headers: { Allow: 'GET' },
            body: JSON.stringify({ status: 'error' }),
        };
    }

    try {
        const backendResponse = await fetch(getBackendHealthUrl(), {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        return {
            status: backendResponse.ok ? 200 : 503,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: backendResponse.ok ? 'ok' : 'error' }),
        };
    } catch {
        return {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'error' }),
        };
    }
}

export default function health(request, response) {
    handler(request).then((result) => {
        response.status(result.status).setHeader('Content-Type', 'application/json');
        if (result.headers?.Allow) {
            response.setHeader('Allow', result.headers.Allow);
        }
        response.send(result.body);
    });
}