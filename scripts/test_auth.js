async function testAuth() {
  const tests = [
    { label: "Admin login with 9999", pin: "9999", expectSuccess: true },
    { label: "Agent login with 1234", pin: "1234", expectSuccess: true },
    { label: "Agent login with 7788", pin: "7788", expectSuccess: true },
    { label: "Rejected old static PIN 0000", pin: "0000", expectSuccess: false },
    { label: "Rejected old static PIN 1111", pin: "1111", expectSuccess: false },
    { label: "Rejected random PIN 9998", pin: "9998", expectSuccess: false },
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
