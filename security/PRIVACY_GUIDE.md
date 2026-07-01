# Privacy & Data Handling Guide

`safe-link-checker` respects end-user privacy by default.

## 1. Offline Mode (Default)
By default, `safe-link-checker` runs entirely locally (Offline Mode).
- **No data leaves the device/server.** 
- Heuristics, Homograph detection, and Entropy analysis occur in-memory.

## 2. Cloud Mode / Providers
If you explicitly enable Providers (e.g., `URLHaus`, `OpenPhish`) or use the `Safe Link Cloud` gateway:
- Only the URL and metadata (timestamp, runtime) are transmitted.
- **Data Minimization**: Query parameters containing PII (e.g., `?token=xxx&email=yyy`) are scrubbed by the normalization engine *before* being transmitted to external providers.

## 3. GDPR and CCPA Compliance
Because the SDK scrubs PII from URLs prior to network transmission, it acts as a privacy-enhancing intermediary, aiding in GDPR/CCPA compliance for downstream logs.
