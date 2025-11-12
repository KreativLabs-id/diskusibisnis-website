const axios = require('axios');

async function testRegister() {
    try {
        console.log('Testing register endpoint...');
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'test@example.com',
            password: 'password123',
            displayName: 'Test User'
        });

        console.log('✅ Registration successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Registration failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
