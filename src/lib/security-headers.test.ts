import { describe, it, expect } from 'vitest';
import { applySecurityHeaders, getSecurityHeaders } from './security-headers';

describe('security headers helper', () => {
  it('provides the baseline security headers', () => {
    const headers = getSecurityHeaders();

    expect(headers['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy']).toContain('https://*.supabase.co');
  });

  it('includes explicit Supabase project origins when provided', () => {
    const headers = getSecurityHeaders({ supabaseUrl: 'https://example-project.supabase.co' });

    expect(headers['Content-Security-Policy']).toContain('https://example-project.supabase.co');
    expect(headers['Content-Security-Policy']).toContain('wss://example-project.supabase.co');
  });

  it('applies headers onto a Headers instance', () => {
    const responseHeaders = new Headers();

    applySecurityHeaders(responseHeaders, { supabaseUrl: 'https://example-project.supabase.co' });

    expect(responseHeaders.get('Content-Security-Policy')).toContain('https://example-project.supabase.co');
    expect(responseHeaders.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
  });
});
