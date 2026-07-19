// @generated from openapi/v1.json; DO NOT EDIT.
export interface paths {
    "/captures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createCapture"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/honeymoon-periods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listHoneymoonPeriods"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/honeymoon-periods/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get: operations["getHoneymoonPeriod"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateHoneymoonPeriod"];
        trace?: never;
    };
    "/honeymoon-periods/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get: operations["getHoneymoonPeriodHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/honeymoon-periods/{id}/notes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createNote"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/honeymoon-periods/{id}/notes/{noteId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
                noteId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateNote"];
        trace?: never;
    };
    "/honeymoon-periods/{id}/preference-changes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createPreferenceChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Capture: {
            actor_id: string;
            /** Format: date-time */
            captured_at: string;
            client_request_id: string;
            /** @enum {string} */
            enrichment_status: "pending" | "complete" | "failed";
            /** Format: uuid */
            honeymoon_period_id: string;
            /** Format: uuid */
            id: string;
            /** Format: uri */
            source_url: string;
        };
        CaptureInput: {
            client_request_id: string;
            source_url: string;
        };
        CaptureResult: {
            capture: components["schemas"]["Capture"];
            honeymoon_period: components["schemas"]["HoneymoonPeriod"];
            /** @enum {string} */
            status: "created" | "existing" | "replayed";
        };
        ErrorEnvelope: {
            error: {
                code: string;
                fields?: {
                    [key: string]: string;
                };
                message: string;
            };
        };
        HistoryEvent: {
            /** Format: date-time */
            accepted_at: string;
            actor_id: string;
            changes: components["schemas"]["PreferenceChangedData"];
            display_name: string;
            /** Format: uuid */
            honeymoon_period_id: string;
            /** Format: uuid */
            id: string;
            reason: string | null;
            sequence: number;
            /** @enum {string} */
            type: "PreferenceChanged";
        };
        HistoryPage: {
            items: components["schemas"]["HistoryEvent"][];
        };
        HoneymoonPeriod: {
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            id: string;
            kind: string;
            metadata: components["schemas"]["Metadata"];
            metadata_updated_by_actor_id: string | null;
            /** Format: uri */
            normalized_url: string;
            rank: components["schemas"]["Rank"];
            rank_boost: number;
            status: components["schemas"]["Status"];
            title: string;
            /** Format: date-time */
            updated_at: string;
        };
        HoneymoonPeriodDetail: {
            captures: components["schemas"]["Capture"][];
            history: components["schemas"]["HistoryPage"];
            item: components["schemas"]["HoneymoonPeriod"];
            notes: components["schemas"]["Note"][];
            preferences: components["schemas"]["Preference"][];
        };
        HoneymoonPeriodPage: {
            items: components["schemas"]["HoneymoonPeriod"][];
            page: number;
            per_page: number;
            total: number;
        };
        HoneymoonPeriodUpdate: {
            kind?: string;
            metadata?: components["schemas"]["Metadata"];
            rank_boost?: number;
            status?: components["schemas"]["Status"];
            title?: string;
        };
        Metadata: {
            address?: string;
            cuisine?: string;
            decline_reason?: string;
            special?: string;
            /** Format: date */
            special_date?: string;
            timing?: string;
        } & {
            [key: string]: unknown;
        };
        Note: {
            actor_id: string;
            body: string;
            /** Format: date-time */
            created_at: string;
            display_name: string;
            /** Format: uuid */
            honeymoon_period_id: string;
            /** Format: uuid */
            id: string;
        };
        NoteInput: {
            body: string;
        };
        Preference: {
            actor_id: string;
            display_name: string;
            /** Format: uuid */
            honeymoon_period_id: string;
            score: number | null;
            /** Format: date-time */
            updated_at: string;
            vote: components["schemas"]["Vote"];
        };
        PreferenceChangedData: {
            score: {
                after: number | null;
                before: number | null;
            };
            vote: {
                after: components["schemas"]["Vote"];
                before: components["schemas"]["Vote"];
            };
        };
        PreferenceChangeInput: {
            client_request_id: string;
            reason?: string;
            score: number | null;
            vote: components["schemas"]["Vote"];
        };
        PreferenceChangeResult: {
            event: components["schemas"]["HistoryEvent"] | null;
            /** @enum {string} */
            status: "changed" | "unchanged";
        };
        Rank: {
            boost: number;
            score: number;
            total: number;
            votes: number;
        };
        /** @enum {string} */
        Status: "active" | "planned" | "completed" | "declined";
        /** @enum {string|null} */
        Vote: "interested" | "maybe" | "decline" | null;
    };
    responses: {
        /** @description Stable error envelope */
        Error: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorEnvelope"];
            };
        };
    };
    parameters: {
        Id: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    createCapture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptureInput"];
            };
        };
        responses: {
            /** @description Idempotent replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaptureResult"];
                };
            };
            /** @description Capture created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaptureResult"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    listHoneymoonPeriods: {
        parameters: {
            query?: {
                kind?: string;
                order?: "asc" | "desc";
                page?: number;
                per_page?: number;
                q?: string;
                sort?: "rank" | "newest" | "title";
                status?: components["schemas"]["Status"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ranked page */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HoneymoonPeriodPage"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    getHoneymoonPeriod: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HoneymoonPeriodDetail"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    updateHoneymoonPeriod: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HoneymoonPeriodUpdate"];
            };
        };
        responses: {
            /** @description Updated detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HoneymoonPeriodDetail"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    getHoneymoonPeriodHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Shared chronological history */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HistoryPage"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    createNote: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NoteInput"];
            };
        };
        responses: {
            /** @description Note created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Note"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    updateNote: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
                noteId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NoteInput"];
            };
        };
        responses: {
            /** @description Note updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Note"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
    createPreferenceChange: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreferenceChangeInput"];
            };
        };
        responses: {
            /** @description Original preference change result replayed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceChangeResult"];
                };
            };
            /** @description Preference change accepted */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceChangeResult"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            409: components["responses"]["Error"];
            429: components["responses"]["Error"];
            500: components["responses"]["Error"];
        };
    };
}
