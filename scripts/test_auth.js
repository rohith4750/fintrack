async function testAuth() {
  const tests = [
    { label: "Admin login with new PIN 1002", pin: "1002", expectSuccess: true },
    { label: "Agent login with 1234", pin: "1234", expectSuccess: true },
    { label: "Agent login with 7788", pin: "7788", expectSuccess: true },
    { label: "Old Admin PIN 9999 (should now fail)", pin: "9999", expectSuccess: false },
    { label: "Old static PIN 0000 (should fail)", pin: "0000", expectSuccess: false },
    { label: "Old static PIN 1111 (should fail)", pin: "1111", expectSuccess: false },
  ];

  console.log("Starting Auth Verification Tests against http://localhost:3001/api/auth/login...\n");

  for (const t of tests) {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: t.pin }),
      });
      const data = await res.json();
      const passed = data.success === t.expectSuccess;
      console.log(`${passed ? "✓ PASS" : "✗ FAIL"}: [${t.label}] (Status: ${res.status}) -> success: ${data.success}, user: ${data.user?.name || 'none'} (${data.user?.role || 'none'})`);
    } catch (e) {
      console.error(`Error testing ${t.label}:`, e.message);
    }
  }
}

testAuth();
