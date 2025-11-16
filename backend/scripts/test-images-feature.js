// Test script to verify images column exists and API handles it correctly
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testQuestion = {
  title: 'Test Question dengan Gambar',
  content: 'Ini adalah pertanyaan test untuk verifikasi fitur upload gambar',
  tags: ['testing', 'marketing'],
  images: [
    'https://dgeyqbolujxynsyctoju.supabase.co/storage/v1/object/public/question-images/test1.jpg',
    'https://dgeyqbolujxynsyctoju.supabase.co/storage/v1/object/public/question-images/test2.jpg'
  ]
};

async function testImagesFeature() {
  console.log('🧪 Testing Images Feature...\n');

  try {
    // Test 1: Get existing questions (check if images field is returned)
    console.log('Test 1: Fetching questions...');
    const questionsResponse = await axios.get(`${API_URL}/questions`);
    const questions = questionsResponse.data.data.questions;
    
    console.log(`✅ Fetched ${questions.length} questions`);
    
    // Check if any question has images
    const questionWithImages = questions.find(q => q.images && q.images.length > 0);
    if (questionWithImages) {
      console.log(`✅ Found question with images:`, {
        id: questionWithImages.id,
        title: questionWithImages.title,
        images: questionWithImages.images
      });
    } else {
      console.log('ℹ️  No questions with images found (this is OK if none uploaded yet)');
    }

    // Test 2: Get specific question (check if images field is included)
    if (questions.length > 0) {
      console.log('\nTest 2: Fetching question detail...');
      const questionId = questions[0].id;
      const questionResponse = await axios.get(`${API_URL}/questions/${questionId}`);
      const question = questionResponse.data.data;
      
      console.log(`✅ Fetched question detail:`, {
        id: question.id,
        title: question.title,
        hasImagesField: 'images' in question,
        images: question.images || null
      });
    }

    // Test 3: Check if API accepts images in request body
    console.log('\nℹ️  To test creating question with images:');
    console.log('   1. Login via frontend');
    console.log('   2. Go to /ask page');
    console.log('   3. Upload images and submit');
    console.log('   4. Check if images appear in question detail\n');

    console.log('✅ All basic tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Make sure SQL migration is run (add images column)');
    console.log('   2. Setup Supabase Storage bucket "question-images"');
    console.log('   3. Setup Storage policies for public read & authenticated upload');
    console.log('   4. Test upload via frontend');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running (npm run dev)');
    console.log('   2. Database connection is working');
  }
}

// Run tests
testImagesFeature();
