async function runTests() {
  console.log("--- Testing Reset Provider Quota via Webhook ---");
  try {
    const res1 = await fetch('http://localhost:3000/api/webhook/reset-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookId: `test-uuid-${Date.now()}`, providerId: 1 })
    });
    console.log("Reset Quota Result:", await res1.json());
  } catch (err) {
    console.error("Reset Quota Error:", err.message);
  }

  console.log("\n--- Testing Webhook Idempotency ---");
  const fixedUuid = `idemp-test-${Date.now()}`;
  const idempReqs = Array.from({ length: 3 }).map((_, i) => {
    return fetch('http://localhost:3000/api/webhook/reset-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookId: fixedUuid, providerId: 2 })
    }).then(r => r.json());
  });
  try {
    const idempResults = await Promise.all(idempReqs);
    idempResults.forEach((res, i) => console.log(`Idempotency Response ${i + 1}:`, res));
  } catch (err) {
    console.error("Idempotency Error:", err.message);
  }

  console.log("\n--- Testing Concurrency (10 Instant Leads) ---");
  const concReqs = Array.from({ length: 10 }).map((_, i) => {
    const randomPhone = `555${Math.floor(1000000 + Math.random() * 9000000)}`;
    return fetch('http://localhost:3000/api/request-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Concurrent User ${i + 1}`,
        phone: randomPhone,
        city: 'Test City',
        serviceType: '1',
        description: 'Concurrency Test'
      })
    }).then(r => r.json());
  });
  try {
    const concResults = await Promise.all(concReqs);
    concResults.forEach((res, i) => console.log(`Concurrency Response ${i + 1}:`, res));
  } catch (err) {
    console.error("Concurrency Error:", err.message);
  }
}

runTests();
