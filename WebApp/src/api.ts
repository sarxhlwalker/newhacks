export interface APIResponse<T> {
    ok: boolean;
    httpStatus: number;
    error: string | null;
    data: T;
}

export function apiGet<T>(endpoint: string, body: any) {
    return _apiCall<T>(endpoint, "GET", body);
}

export function apiPost<T>(endpoint: string, body: any) {
    return _apiCall<T>(endpoint, "POST", body);
}

async function _apiCall<T>(endpoint: string, method: string, body: any) {
    let response = await fetch(window.location.origin + "/" + endpoint, {
        method: method,
        body: JSON.stringify(body),
    });

    let jsonText = await response.text();
    let ok = response.ok;
    let data: {
        ok: boolean;
        error: string | null;
        data: T;
    };
    let error: string | null = null;

    try {
        data = JSON.parse(jsonText);
        error = data.error || null;
        ok = data.ok || false;
    } catch {
        data = null as any;
        error = "An unknown error ocurred";
        ok = false;
    }

    let responseData: APIResponse<T> = {
        ok: ok,
        httpStatus: response.status,
        error: error,
        data: data.data,
    };

    return responseData;
}
