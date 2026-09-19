async function testLan() {
  try {
    const res = await fetch("http://192.168.31.178:3001/api/agents");
    console.log("LAN GET /api/agents Status:", res.status);
    const data = await res.json();
    console.log("Agents count:", data.agents?.length);
  } catch (err) {
    console.error("LAN fetch error:", err.message);
  }
}

testLan();
