// This script can be run with Node.js or Bun to test the headline enhancer
// Usage: node scripts/test-headline-enhancer.js
// or: bun scripts/test-headline-enhancer.js

// Import required libraries - you may need to install these first via npm or bun
// npm install dotenv node-fetch
// or: bun add dotenv node-fetch
import 'dotenv/config';
import fetch from 'node-fetch';

async function testHeadlineEnhancement() {
  try {
    const baseUrl = 'http://localhost:3000'; // Update if using a different port
    const response = await fetch(`${baseUrl}/api/test/headlines`);
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Response: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('Headline Enhancement Test Results:');
    console.log('==================================');
    console.log(`AI enhancement enabled: ${data.enabled}`);
    console.log(`OpenAI API Key configured: ${data.apiKeySet}`);
    console.log('');
    
    if (data.results) {
      data.results.forEach((result, index) => {
        console.log(`Example ${index + 1}:`);
        console.log(`Original: ${result.original}`);
        console.log(`Enhanced: ${result.enhanced}`);
        console.log('');
      });
    }
    
    if (data.error) {
      console.error(`Error: ${data.error}`);
      if (data.message) {
        console.error(`Message: ${data.message}`);
      }
    }
  } catch (error) {
    console.error('Failed to test headline enhancement:', error);
  }
}

testHeadlineEnhancement();
