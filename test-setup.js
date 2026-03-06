const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const [key, ...val] = line.split('=');
        if (val.length) env[key.trim()] = val.join('=').trim();
    }
});

const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupTestAccounts() {
    console.log("Setting up test accounts...");

    // Customer
    const { data: customer, error: custErr } = await supabaseAdmin.auth.admin.createUser({
        email: "customer@test.com",
        password: "password123",
        email_confirm: true,
        user_metadata: { name: "Test Customer" },
    });
    if (custErr && !custErr.message.includes("already registered")) console.error("Cust Error:", custErr);

    // Tech
    const { data: tech, error: techErr } = await supabaseAdmin.auth.admin.createUser({
        email: "tech@test.com",
        password: "password123",
        email_confirm: true,
        user_metadata: { name: "Test Tech", role: "technician" },
    });
    if (techErr && !techErr.message.includes("already registered")) console.error("Tech Error:", techErr);

    // Fetch Tech ID
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const techId = data.users.find(u => u.email === "tech@test.com")?.id;

    if (techId) {
        await supabaseAdmin.from("technicians").upsert({
            id: techId,
            name: "Test Tech",
            phone: "1234567890",
            rating: 5.0,
            lat: 28.6139, // New Delhi
            lon: 77.2090,
            current_lat: 28.6139,
            current_lon: 77.2090,
            is_available: true,
            vehicle_type: "bike"
        });
    }

    console.log(`\n✅ TEST CREDENTIALS READY
Customer: customer@test.com / password123
Technician: tech@test.com / password123
`);
}

setupTestAccounts();
