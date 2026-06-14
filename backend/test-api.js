import fetch from 'node-fetch';

async function testOrder() {
    const orderData = {
        customerInfo: { name: 'Test', phone: '1234567890', address: 'Test Addr' },
        orderItems: [{ menuItem: 'sv1', name: 'Margherita', quantity: 1, price: 110 }],
        totalAmount: 110,
        orderType: 'delivery',
        paymentMethod: 'cash'
    };

    try {
        const res = await fetch('https://pizza-backend-api-a5mm.onrender.com/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Body:', data);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testOrder();
