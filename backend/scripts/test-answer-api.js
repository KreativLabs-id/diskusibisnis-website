const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = '';
let questionId = '';
let answerId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testAnswerAPI() {
  try {
    log('\n=== Testing Answer API ===\n', colors.blue);

    // Step 1: Login
    log('Step 1: Login...', colors.yellow);
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      authToken = loginResponse.data.data.token;
      log('✓ Login successful!', colors.green);
      log(`Token: ${authToken.substring(0, 20)}...`, colors.reset);
    } catch (error) {
      log('✗ Login failed! Please create a test user first.', colors.red);
      log('Run this SQL:', colors.yellow);
      log(`
INSERT INTO users (id, email, password_hash, display_name, role, is_verified)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  '$2a$10$rKJH8Kx.JYqHQx8YqVxVVeL8Q8PvZLf5N5oKq5WH5aL5L5L5L5L5L5', -- password: password123
  'Test User',
  'user',
  true
);
      `, colors.reset);
      return;
    }

    // Step 2: Get first question
    log('\nStep 2: Getting first question...', colors.yellow);
    try {
      const questionsResponse = await axios.get(`${API_URL}/questions?limit=1`);
      if (questionsResponse.data.data.questions.length === 0) {
        log('✗ No questions found! Please create a question first.', colors.red);
        return;
      }
      questionId = questionsResponse.data.data.questions[0].id;
      log('✓ Question found!', colors.green);
      log(`Question ID: ${questionId}`, colors.reset);
      log(`Title: ${questionsResponse.data.data.questions[0].title}`, colors.reset);
    } catch (error) {
      log('✗ Failed to get questions!', colors.red);
      log(error.message, colors.red);
      return;
    }

    // Step 3: Test with invalid content (too short)
    log('\nStep 3: Testing with short content (should fail)...', colors.yellow);
    try {
      await axios.post(
        `${API_URL}/answers`,
        {
          content: 'Too short',
          questionId: questionId
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      log('✗ Should have failed but succeeded!', colors.red);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✓ Validation worked! Error message:', colors.green);
        log(JSON.stringify(error.response.data, null, 2), colors.reset);
      } else {
        log('✗ Unexpected error!', colors.red);
        log(error.message, colors.red);
      }
    }

    // Step 4: Test with valid content
    log('\nStep 4: Testing with valid content (should succeed)...', colors.yellow);
    try {
      const answerResponse = await axios.post(
        `${API_URL}/answers`,
        {
          content: 'Ini adalah jawaban test yang valid dengan minimal 20 karakter untuk memastikan API berfungsi dengan baik.',
          questionId: questionId
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      answerId = answerResponse.data.data.answer.id;
      log('✓ Answer created successfully!', colors.green);
      log('Response:', colors.reset);
      log(JSON.stringify(answerResponse.data, null, 2), colors.reset);
    } catch (error) {
      log('✗ Failed to create answer!', colors.red);
      if (error.response) {
        log('Error response:', colors.red);
        log(JSON.stringify(error.response.data, null, 2), colors.reset);
      } else {
        log(error.message, colors.red);
      }
      return;
    }

    // Step 5: Verify answer in database
    log('\nStep 5: Verifying answer was saved...', colors.yellow);
    try {
      const verifyResponse = await axios.get(`${API_URL}/answers/${answerId}`);
      log('✓ Answer found in database!', colors.green);
      log('Answer data:', colors.reset);
      log(JSON.stringify(verifyResponse.data, null, 2), colors.reset);
    } catch (error) {
      log('✗ Failed to verify answer!', colors.red);
      log(error.message, colors.red);
    }

    // Step 6: Test without authentication
    log('\nStep 6: Testing without authentication (should fail)...', colors.yellow);
    try {
      await axios.post(
        `${API_URL}/answers`,
        {
          content: 'Ini adalah jawaban test yang valid dengan minimal 20 karakter.',
          questionId: questionId
        }
      );
      log('✗ Should have failed but succeeded!', colors.red);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        log('✓ Authentication check worked!', colors.green);
        log(JSON.stringify(error.response.data, null, 2), colors.reset);
      } else {
        log('✗ Unexpected error!', colors.red);
        log(error.message, colors.red);
      }
    }

    // Cleanup: Delete test answer
    log('\nCleaning up test answer...', colors.yellow);
    try {
      await axios.delete(`${API_URL}/answers/${answerId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      log('✓ Test answer deleted!', colors.green);
    } catch (error) {
      log('⚠ Failed to delete test answer (you may need to delete manually)', colors.yellow);
    }

    log('\n=== All Tests Completed! ===\n', colors.blue);

  } catch (error) {
    log('\n✗ Test suite failed!', colors.red);
    log(error.message, colors.red);
    if (error.stack) {
      log(error.stack, colors.reset);
    }
  }
}

// Run tests
testAnswerAPI();
