const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_EMAIL = 'testhost@example.com';
const TEST_PASSWORD = 'password123';

// Test scenarios
const testScenarios = [
  {
    name: 'Valid withdrawal with mobile money',
    data: {
      amount: 10000,
      withdrawalMethod: 'MOBILE_MONEY',
      phone: '+237612345678'
    }
  },
  {
    name: 'Invalid amount (zero)',
    data: {
      amount: 0,
      withdrawalMethod: 'MOBILE_MONEY',
      phone: '+237612345678'
    },
    expectError: true
  },
  {
    name: 'Missing withdrawal method',
    data: {
      amount: 10000,
      phone: '+237612345678'
    },
    expectError: true
  },
  {
    name: 'Invalid amount (negative)',
    data: {
      amount: -1000,
      withdrawalMethod: 'MOBILE_MONEY',
      phone: '+237612345678'
    },
    expectError: true
  }
];

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.success) {
      console.log('✅ Login successful');
      return response.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function getWalletBalance(token) {
  try {
    console.log('💰 Getting wallet balance...');
    const response = await axios.get(`${BASE_URL}/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ Wallet balance:', response.data.data.balance, 'XAF');
      return response.data.data.balance;
    }
  } catch (error) {
    console.error('❌ Failed to get wallet balance:', error.response?.data || error.message);
    return 0;
  }
}

async function testWithdrawal(token, scenario) {
  try {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log('📤 Request data:', JSON.stringify(scenario.data, null, 2));
    
    const response = await axios.post(`${BASE_URL}/wallet/withdraw`, scenario.data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (scenario.expectError) {
      console.log('❌ Expected error but got success:', response.data);
    } else {
      console.log('✅ Withdrawal successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    if (scenario.expectError) {
      console.log('✅ Expected error received:', error.response?.data || error.message);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function getWithdrawalHistory(token) {
  try {
    console.log('\n📜 Getting withdrawal history...');
    const response = await axios.get(`${BASE_URL}/wallet/withdrawals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ Withdrawal history retrieved');
      console.log('📊 Recent withdrawals:', JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Failed to get withdrawal history:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting withdrawal endpoint tests...\n');
  
  // Login first
  const token = await login();
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  // Get current wallet balance
  const balance = await getWalletBalance(token);
  
  // Run test scenarios
  for (const scenario of testScenarios) {
    await testWithdrawal(token, scenario);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Get withdrawal history
  await getWithdrawalHistory(token);
  
  // Get final balance
  console.log('\n💰 Final wallet balance:');
  await getWalletBalance(token);
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
