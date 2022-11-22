export const SESSION_SECRET =
  "Y!?BE&Ct8gkqH@x+HP?f+xh^HP&b^8xYY!?BE&Ct8f+xh^HP&b^8xY";
export const PRODUCTION = process.env.NODE_ENV === "production";
export const { CORS_ORIGIN_URL } = process.env as Record<string, string>;
export const COOKIE_NAME = "qid";
export const SESSION_TTL = 315360e6; // 10 years
export const SESSION_KEY = "data";
