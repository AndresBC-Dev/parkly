import axios from 'axios';

async function test() {
    const api = axios.create({ baseURL: 'http://localhost:8080/api' });
    
    console.log("Fetching customers...");
    const res = await api.get('/customers');
    console.log("Found", res.data.length, "customers");

    console.log("Creating customer...");
    const createRes = await api.post('/customers', {
        name: "Test User",
        email: "test@example.com",
        phone: "123456789",
        plates: ["TEST-123"],
        plan: "casual"
    });
    const newId = createRes.data.id;
    console.log("Created customer with ID:", newId);

    console.log("Updating customer...");
    await api.put(`/customers/${newId}`, {
        name: "Updated Test User",
        email: "test@example.com",
        phone: "987654321",
        plates: ["TEST-123", "TEST-456"],
        plan: "monthly"
    });
    console.log("Updated.");

    console.log("Deleting customer...");
    await api.delete(`/customers/${newId}`);
    console.log("Deleted.");
}

test().catch(console.error);
