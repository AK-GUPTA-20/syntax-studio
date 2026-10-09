import { URL } from 'url';
import net from 'net';

/**
 * Validates a URL against Server-Side Request Forgery (SSRF) targets.
 * Blocks private IP ranges, cloud metadata services (AWS/GCP/Azure),
 * loopback interfaces, and non-HTTP(S) schemes.
 * 
 * @param {string} urlString - Target URL to inspect
 * @returns {{ isSafe: boolean, reason?: string, parsedUrl?: URL }}
 */
export function validateUrlForSsrf(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { isSafe: false, reason: 'URL must be a non-empty string.' };
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch (err) {
    return { isSafe: false, reason: 'Malformed URL format.' };
  }

  // 1. Protocol validation: Only HTTPS allowed for outbound requests
  if (parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `Disallowed protocol '${parsed.protocol}'. Only HTTPS is permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject localhost and local domains
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    return { isSafe: false, reason: 'Local and internal hostnames are prohibited.' };
  }

  // 3. Reject IPv4 loopback & private subnets & metadata IP
  if (net.isIPv4(hostname)) {
    if (isPrivateOrReservedIpv4(hostname)) {
      return { isSafe: false, reason: 'Target IPv4 address is in a private, loopback, or cloud-metadata range.' };
    }
  }

  // 4. Reject IPv6 loopback & private subnets
  if (net.isIPv6(hostname)) {
    if (isPrivateOrReservedIpv6(hostname)) {
      return { isSafe: false, reason: 'Target IPv6 address is in a private or loopback range.' };
    }
  }

  // 5. Cloud metadata endpoints by domain name
  const blockedHostnames = [
    'metadata.google.internal',
    '169.254.169.254',
    'instance-data',
    'metadata'
  ];
  if (blockedHostnames.includes(hostname)) {
    return { isSafe: false, reason: 'Cloud metadata service access prohibited.' };
  }

  return { isSafe: true, parsedUrl: parsed };
}

function isPrivateOrReservedIpv4(ip) {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4) return true;

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;

  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true;

  // 172.16.0.0/12 (Private)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 169.254.0.0/16 (Link-local / Cloud Metadata)
  if (parts[0] === 169 && parts[1] === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (parts[0] === 0) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (parts[0] >= 224) return true;

  return false;
}

function isPrivateOrReservedIpv6(ip) {
  const normalized = ip.toLowerCase();
  // ::1 (Loopback)
  if (normalized === '::1') return true;
  // fe80:: (Link-local)
  if (normalized.startsWith('fe80:')) return true;
  // fc00:: / fd00:: (Unique local)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // ::ffff:127.0.0.1 (IPv4-mapped)
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    if (net.isIPv4(ipv4Part)) {
      return isPrivateOrReservedIpv4(ipv4Part);
    }
  }
  return false;
}
