const BLOCKLIST_URL =
    "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/refs/heads/main/disposable_email_blocklist.conf";

let cachedDomains: Set<string> | null = null;

/**
 * Fetches the disposable email domains blocklist and returns them as a Set (lowercase).
 */
export async function fetchDisposableDomains(): Promise<Set<string>> {
    const res = await fetch(BLOCKLIST_URL);
    if (!res.ok) {
        throw new Error(`Failed to fetch blocklist: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    const domains = new Set<string>();
    for (const line of text.split("\n")) {
        const domain = line.trim().toLowerCase();
        if (domain && !domain.startsWith("#")) {
            domains.add(domain);
        }
    }
    return domains;
}

/**
 * Ensures the blocklist is loaded (uses in-memory cache).
 */
async function ensureLoaded(): Promise<Set<string>> {
    if (cachedDomains) return cachedDomains;
    cachedDomains = await fetchDisposableDomains();
    return cachedDomains;
}

/**
 * Returns true if the email's domain is in the disposable blocklist.
 * @param email - Full email address (e.g. "user@tempmail.com")
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
    const at = email.lastIndexOf("@");
    if (at === -1) return false;
    const domain = email.slice(at + 1).trim().toLowerCase();
    if (!domain) return false;
    const domains = await ensureLoaded();
    return domains.has(domain);
}