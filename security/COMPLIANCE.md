# Compliance Mapping

## OWASP Application Security Verification Standard (ASVS)
`safe-link-checker` assists applications in meeting the following ASVS v4.0.3 controls:
- **V5.1.5**: Verify that the application protects against SSRF. *(Handled via our Node runtime DNS rebinding & private IP blocks)*.
- **V11.1.4**: Verify that URLs are properly validated. *(Handled via the core heuristic engine)*.
- **V14.4.1**: Verify that communication with external APIs uses TLS. *(Handled via `HttpsValidationPlugin`)*.

## SOC 2
The SDK's deterministic output (`evidence` arrays) provides the necessary audit trails required for SOC 2 compliance regarding data validation and threat interception.

## OpenSSF Best Practices
We adhere to the Open Source Security Foundation best practices, enforcing signed commits, mandatory 2FA for npm publishers, SLSA Level 3 provenance, and automated SBOM generation.
