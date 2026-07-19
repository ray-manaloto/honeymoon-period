// @generated from openapi/v1.json; DO NOT EDIT.
export const componentSchemas = {
  "ErrorEnvelope": {
    "type": "object",
    "required": [
      "error"
    ],
    "additionalProperties": false,
    "properties": {
      "error": {
        "type": "object",
        "required": [
          "code",
          "message"
        ],
        "additionalProperties": false,
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "fields": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "Status": {
    "type": "string",
    "enum": [
      "active",
      "planned",
      "completed",
      "declined"
    ]
  },
  "Vote": {
    "type": [
      "string",
      "null"
    ],
    "enum": [
      "interested",
      "maybe",
      "decline",
      null
    ]
  },
  "Metadata": {
    "type": "object",
    "additionalProperties": true,
    "properties": {
      "cuisine": {
        "type": "string"
      },
      "address": {
        "type": "string"
      },
      "timing": {
        "type": "string"
      },
      "special": {
        "type": "string"
      },
      "decline_reason": {
        "type": "string"
      },
      "special_date": {
        "type": "string",
        "format": "date"
      }
    }
  },
  "Rank": {
    "type": "object",
    "required": [
      "score",
      "votes",
      "boost",
      "total"
    ],
    "additionalProperties": false,
    "properties": {
      "score": {
        "type": "number"
      },
      "votes": {
        "type": "number"
      },
      "boost": {
        "type": "number"
      },
      "total": {
        "type": "number"
      }
    }
  },
  "HoneymoonPeriod": {
    "type": "object",
    "required": [
      "id",
      "status",
      "title",
      "kind",
      "normalized_url",
      "metadata",
      "metadata_updated_by_actor_id",
      "rank_boost",
      "rank",
      "created_at",
      "updated_at"
    ],
    "additionalProperties": false,
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "status": {
        "$ref": "#/components/schemas/Status"
      },
      "title": {
        "type": "string"
      },
      "kind": {
        "type": "string"
      },
      "normalized_url": {
        "type": "string",
        "format": "uri"
      },
      "metadata": {
        "$ref": "#/components/schemas/Metadata"
      },
      "metadata_updated_by_actor_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "rank_boost": {
        "type": "number"
      },
      "rank": {
        "$ref": "#/components/schemas/Rank"
      },
      "created_at": {
        "type": "string",
        "format": "date-time"
      },
      "updated_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "Capture": {
    "type": "object",
    "required": [
      "id",
      "honeymoon_period_id",
      "actor_id",
      "source_url",
      "client_request_id",
      "enrichment_status",
      "captured_at"
    ],
    "additionalProperties": false,
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "honeymoon_period_id": {
        "type": "string",
        "format": "uuid"
      },
      "actor_id": {
        "type": "string"
      },
      "source_url": {
        "type": "string",
        "format": "uri"
      },
      "client_request_id": {
        "type": "string"
      },
      "enrichment_status": {
        "type": "string",
        "enum": [
          "pending",
          "complete",
          "failed"
        ]
      },
      "captured_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "Preference": {
    "type": "object",
    "required": [
      "honeymoon_period_id",
      "actor_id",
      "display_name",
      "vote",
      "score",
      "updated_at"
    ],
    "additionalProperties": false,
    "properties": {
      "honeymoon_period_id": {
        "type": "string",
        "format": "uuid"
      },
      "actor_id": {
        "type": "string"
      },
      "display_name": {
        "type": "string"
      },
      "vote": {
        "$ref": "#/components/schemas/Vote"
      },
      "score": {
        "type": [
          "number",
          "null"
        ],
        "minimum": 0,
        "maximum": 5
      },
      "updated_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "Note": {
    "type": "object",
    "required": [
      "id",
      "honeymoon_period_id",
      "actor_id",
      "display_name",
      "body",
      "created_at"
    ],
    "additionalProperties": false,
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "honeymoon_period_id": {
        "type": "string",
        "format": "uuid"
      },
      "actor_id": {
        "type": "string"
      },
      "display_name": {
        "type": "string"
      },
      "body": {
        "type": "string"
      },
      "created_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "CaptureInput": {
    "type": "object",
    "required": [
      "source_url",
      "client_request_id"
    ],
    "additionalProperties": false,
    "properties": {
      "source_url": {
        "type": "string",
        "minLength": 1,
        "maxLength": 4096
      },
      "client_request_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      }
    }
  },
  "CaptureResult": {
    "type": "object",
    "required": [
      "status",
      "capture",
      "honeymoon_period"
    ],
    "additionalProperties": false,
    "properties": {
      "status": {
        "type": "string",
        "enum": [
          "created",
          "existing",
          "replayed"
        ]
      },
      "capture": {
        "$ref": "#/components/schemas/Capture"
      },
      "honeymoon_period": {
        "$ref": "#/components/schemas/HoneymoonPeriod"
      }
    }
  },
  "HoneymoonPeriodPage": {
    "type": "object",
    "required": [
      "items",
      "page",
      "per_page",
      "total"
    ],
    "additionalProperties": false,
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/HoneymoonPeriod"
        }
      },
      "page": {
        "type": "integer"
      },
      "per_page": {
        "type": "integer"
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "HoneymoonPeriodDetail": {
    "type": "object",
    "required": [
      "item",
      "preferences",
      "notes",
      "captures",
      "history"
    ],
    "additionalProperties": false,
    "properties": {
      "item": {
        "$ref": "#/components/schemas/HoneymoonPeriod"
      },
      "preferences": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Preference"
        }
      },
      "notes": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Note"
        }
      },
      "captures": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Capture"
        }
      },
      "history": {
        "$ref": "#/components/schemas/HistoryPage"
      }
    }
  },
  "HoneymoonPeriodUpdate": {
    "type": "object",
    "minProperties": 1,
    "additionalProperties": false,
    "properties": {
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200,
        "pattern": ".*\\S.*"
      },
      "kind": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50,
        "pattern": ".*\\S.*"
      },
      "status": {
        "$ref": "#/components/schemas/Status"
      },
      "metadata": {
        "$ref": "#/components/schemas/Metadata"
      },
      "rank_boost": {
        "type": "number",
        "minimum": -100,
        "maximum": 100
      }
    }
  },
  "PreferenceChangeInput": {
    "type": "object",
    "required": [
      "vote",
      "score",
      "client_request_id"
    ],
    "additionalProperties": false,
    "properties": {
      "vote": {
        "$ref": "#/components/schemas/Vote"
      },
      "score": {
        "type": [
          "number",
          "null"
        ],
        "minimum": 0,
        "maximum": 5
      },
      "client_request_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "reason": {
        "type": "string",
        "minLength": 1,
        "maxLength": 1000,
        "pattern": ".*\\S.*"
      }
    }
  },
  "PreferenceChangedData": {
    "type": "object",
    "required": [
      "vote",
      "score"
    ],
    "additionalProperties": false,
    "properties": {
      "vote": {
        "type": "object",
        "required": [
          "before",
          "after"
        ],
        "additionalProperties": false,
        "properties": {
          "before": {
            "$ref": "#/components/schemas/Vote"
          },
          "after": {
            "$ref": "#/components/schemas/Vote"
          }
        }
      },
      "score": {
        "type": "object",
        "required": [
          "before",
          "after"
        ],
        "additionalProperties": false,
        "properties": {
          "before": {
            "type": [
              "number",
              "null"
            ],
            "minimum": 0,
            "maximum": 5
          },
          "after": {
            "type": [
              "number",
              "null"
            ],
            "minimum": 0,
            "maximum": 5
          }
        }
      }
    }
  },
  "HistoryEvent": {
    "type": "object",
    "required": [
      "sequence",
      "id",
      "type",
      "honeymoon_period_id",
      "actor_id",
      "display_name",
      "accepted_at",
      "reason",
      "changes"
    ],
    "additionalProperties": false,
    "properties": {
      "sequence": {
        "type": "integer",
        "minimum": 1
      },
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "type": {
        "type": "string",
        "enum": [
          "PreferenceChanged"
        ]
      },
      "honeymoon_period_id": {
        "type": "string",
        "format": "uuid"
      },
      "actor_id": {
        "type": "string"
      },
      "display_name": {
        "type": "string"
      },
      "accepted_at": {
        "type": "string",
        "format": "date-time"
      },
      "reason": {
        "type": [
          "string",
          "null"
        ]
      },
      "changes": {
        "$ref": "#/components/schemas/PreferenceChangedData"
      }
    }
  },
  "HistoryPage": {
    "type": "object",
    "required": [
      "items"
    ],
    "additionalProperties": false,
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/HistoryEvent"
        }
      }
    }
  },
  "PreferenceChangeResult": {
    "type": "object",
    "required": [
      "status",
      "event"
    ],
    "additionalProperties": false,
    "properties": {
      "status": {
        "type": "string",
        "enum": [
          "changed",
          "unchanged"
        ]
      },
      "event": {
        "oneOf": [
          {
            "$ref": "#/components/schemas/HistoryEvent"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "NoteInput": {
    "type": "object",
    "required": [
      "body"
    ],
    "additionalProperties": false,
    "properties": {
      "body": {
        "type": "string",
        "minLength": 1,
        "maxLength": 4000,
        "pattern": ".*\\S.*"
      }
    }
  }
} as const;
