// Script to create admin account
// Usage: node scripts/create-admin.js

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://diskusi-bisnis-r80ga8i54-kreativlabsids-projects.vercel.app';

function makeRequest(url, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function createAdmin() {
    try {
        console.log('🔄 Creating admin account...');
        console.log('🌐 API URL:', API_URL);
        
        const data = await makeRequest(`${API_URL}/api/admin/create-admin`, {
            email: 'admin@diskusibisnis.com',
            password: 'admindiskusibisnis123',
            displayName: 'Admin DiskusiBisnis',
            adminKey: 'create-admin-diskusibisnis-2024'
        });
        
        if (data.success) {
            console.log('✅ Admin account created successfully!');
            console.log('📧 Email:', data.data.user.email);
            console.log('👤 Name:', data.data.user.display_name);
            console.log('🔑 Role:', data.data.user.role);
            console.log('\n🚀 You can now login with:');
            console.log('Email: admin@diskusibisnis.com');
            console.log('Password: admindiskusibisnis123');
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
        console.log('\n💡 Alternative: Register manually at the website and update database role.');
    }
}

createAdmin();
