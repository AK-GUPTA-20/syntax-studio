import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 ==========================================');
  console.log('🧪 STARTING AUTOMATED TEST SUITE FOR SYNTAX STUDIO');
  console.log('🧪 ==========================================');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health endpoint
  await test('GET /api/health returns healthy', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'healthy') {
      throw new Error(`Expected status healthy, got ${JSON.stringify(data)}`);
    }
  });

  // 2. Projects list
  await test('GET /api/projects returns seeded projects', async () => {
    const res = await fetch(`${BASE_URL}/projects`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length < 5) {
      throw new Error(`Expected at least 5 projects, got ${data.data?.length}`);
    }
  });

  // 3. Project by slug
  await test('GET /api/projects/greencart returns GreenCart project', async () => {
    const res = await fetch(`${BASE_URL}/projects/greencart`);
    const data = await res.json();
    if (!data.success || data.data?.slug !== 'greencart') {
      throw new Error(`Expected slug 'greencart', got ${data.data?.slug}`);
    }
  });

  // 4. Team members
  await test('GET /api/team returns Akshat Gupta & Vasu Singhal', async () => {
    const res = await fetch(`${BASE_URL}/team`);
    const data = await res.json();
    const names = data.data?.map(m => m.name) || [];
    if (!names.includes('Akshat Gupta') || !names.includes('Vasu Singhal')) {
      throw new Error(`Expected Akshat & Vasu in team, got ${names.join(', ')}`);
    }
  });

  // 5. Team by slug
  await test('GET /api/team/akshat-gupta returns Akshat details', async () => {
    const res = await fetch(`${BASE_URL}/team/akshat-gupta`);
    const data = await res.json();
    if (!data.success || data.data?.name !== 'Akshat Gupta') {
      throw new Error(`Expected Akshat Gupta, got ${data.data?.name}`);
    }
  });

  await test('GET /api/team/vasu-singhal returns Vasu details', async () => {
    const res = await fetch(`${BASE_URL}/team/vasu-singhal`);
    const data = await res.json();
    if (!data.success || data.data?.name !== 'Vasu Singhal') {
      throw new Error(`Expected Vasu Singhal, got ${data.data?.name}`);
    }
  });

  // 6. Services
  await test('GET /api/services returns 8 agency services', async () => {
    const res = await fetch(`${BASE_URL}/services`);
    const data = await res.json();
    if (!data.success || data.data?.length !== 8) {
      throw new Error(`Expected 8 services, got ${data.data?.length}`);
    }
  });

  // 7. Contact form validation (invalid submission)
  await test('POST /api/contact rejects invalid email with 400', async () => {
    const res = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'not-an-email', message: 'Hello' })
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 validation error, got ${res.status}`);
    }
  });

  // 8. Contact form submission (valid submission)
  await test('POST /api/contact saves valid inquiry', async () => {
    const res = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Client',
        email: 'client@example.com',
        company: 'Test Corp',
        projectType: 'Full-Stack Web Development',
        message: 'This is an automated test inquiry verifying the contact API pipeline.'
      })
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success) {
      throw new Error(`Expected 201 created, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 9. Admin Login
  let adminToken = '';
  await test('POST /api/auth/login authenticates with valid admin password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'akshat0021' })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.data?.token) {
      throw new Error(`Failed to authenticate, status: ${res.status}`);
    }
    adminToken = data.data.token;
  });

  // 10. Admin protected endpoint
  await test('GET /api/contact with admin token returns inquiries', async () => {
    const res = await fetch(`${BASE_URL}/contact`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error(`Expected inquiries array, got ${JSON.stringify(data)}`);
    }
  });

  // 11. Studio settings endpoint
  await test('GET /api/settings returns studio config', async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    const data = await res.json();
    if (!data.success || !data.data?.companyName) {
      throw new Error(`Expected studio settings with companyName, got ${JSON.stringify(data)}`);
    }
  });

  await test('PUT /api/settings updates studio config with admin token', async () => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ heroAnnouncement: 'Updated via test suite' })
    });
    const data = await res.json();
    if (!data.success || data.data?.heroAnnouncement !== 'Updated via test suite') {
      throw new Error(`Failed to update settings, got ${JSON.stringify(data)}`);
    }
  });

  // 12. Upload validation
  await test('POST /api/upload requires file payload and auth', async () => {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    // Should reject without auth or file
    if (res.status !== 401 && res.status !== 400) {
      throw new Error(`Expected 401 or 400, got ${res.status}`);
    }
  });

  console.log('🧪 ==========================================');
  console.log(`🧪 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('🧪 ==========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
