export const SONG_STATUSES = ["draft", "published", "archived"] as const;
export type SongStatus = (typeof SONG_STATUSES)[number];

export const SUBMISSION_STATUSES = [
  "researching",
  "ready_to_submit",
  "submitted",
  "awaiting_response",
  "accepted",
  "rejected",
  "published",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const OPEN_SUBMISSION_STATUSES: SubmissionStatus[] = [
  "researching",
  "ready_to_submit",
  "submitted",
  "awaiting_response",
];

export const PENDING_RESPONSE_STATUSES: SubmissionStatus[] = ["submitted", "awaiting_response"];

export const STATUS_LABELS: Record<SubmissionStatus | SongStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  researching: "Researching",
  ready_to_submit: "Ready to Submit",
  submitted: "Submitted",
  awaiting_response: "Awaiting Response",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const FUMPI_OUTLET_NAME = "The FuMP Sideshow";
export const OMAR_SLUG = "omar-is-going-away";
export const SESSION_COOKIE = "min_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const MAX_AUDIO_BYTES = 30 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const LOGIN_LIMIT = 8;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
