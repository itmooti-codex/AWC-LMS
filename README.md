Alerts retry configuration
-------------------------

The alerts creator now retries failed creations until success with exponential backoff. You can tune behavior at runtime via `window.AWC.alertsRetryConfig` before calling `createAlert`/`createAlerts`.

Example:

```
window.AWC = window.AWC || {};
window.AWC.alertsRetryConfig = {
  initialDelayMs: 500,   // first backoff delay
  maxDelayMs: 30000,     // cap between attempts
  factor: 2,             // backoff multiplier
  jitter: 0.2,           // +/- 20% randomization
  // maxAttempts: Infinity // default: retry until success
};
```

Retries are skipped (error thrown) for likely-fatal errors (e.g., validation/authorization issues, HTTP 4xx), to avoid infinite loops on permanent failures.
