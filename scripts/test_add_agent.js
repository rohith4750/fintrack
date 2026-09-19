async function testAddAgent() {
  try {
    const payload = {
      name: "New Test Agent",
      phone: "+91 99887 76655",
      loginId: "AGT-TEST",
      pin: "4321",
      password: "agentpassword",
      role: "AGENT",
      todayTarget: 30000,
      maxDailyCashLimit: 75000,
    };

    const res = await fetch("http://localhost:3001/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAddAgent();
