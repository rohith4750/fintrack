async function testHandover() {
  const payload = {
    agentId: "USR-02",
    agentName: "Ramesh Varma",
    date: "2026-09-20",
    time: "05:22 PM",
    totalCashAmount: 18500,
    totalUpiAmount: 4200,
    totalCollections: 12,
    handedOverTo: "Rajesh Kumar (Admin)",
    denominations: {
      notes500: 35,
      notes200: 4,
      notes100: 2,
    },
    remarks: "Evening field recovery cash bundle",
  };

  try {
    console.log("Submitting Cash Handover to /api/handover...");
    const res = await fetch("http://localhost:3001/api/handover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("POST /api/handover response status:", res.status);
    console.log("Saved Handover in PostgreSQL:", JSON.stringify(data, null, 2));

    console.log("\nFetching all handovers (Admin view)...");
    const getRes = await fetch("http://localhost:3001/api/handover");
    const getData = await getRes.json();
    console.log("Admin Handovers Count:", getData.handovers?.length);
    getData.handovers?.forEach(h => {
      console.log(`- Voucher: ${h.handoverNumber}, Agent: ${h.agentName}, Cash: ₹${h.totalCashAmount}, Status: ${h.status}, Handed Over To: ${h.handedOverTo}`);
    });
  } catch (e) {
    console.error("Test error:", e.message);
  }
}

testHandover();
