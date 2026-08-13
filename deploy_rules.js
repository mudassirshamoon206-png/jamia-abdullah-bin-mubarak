// Firestore rules deployment script using Firebase REST API
// Run: node deploy_rules.js

const https = require('https');
const fs = require('fs');

// Firebase project configuration
const PROJECT_ID = 'markaz-abdullah-bin-mubarak';

// Read the rules file
const rules = fs.readFileSync('./firestore.rules', 'utf8');

// Use Firebase CLI token if available, otherwise use service account
// This uses the Application Default Credentials approach
const { execSync } = require('child_process');

let token;
try {
  // Try to get Firebase token from logged-in firebase-tools
  token = execSync('npx firebase-tools login:ci --no-localhost 2>/dev/null || npx firebase-tools --print-token 2>/dev/null', { timeout: 10000 }).toString().trim();
} catch (e) {
  console.log('Could not get Firebase token automatically');
}

// Use Google APIs to update rules
// First, get access token from gcloud/firebase
function deployRulesViaAPI() {
  console.log('Rules content:', rules.substring(0, 100) + '...');
  console.log('Project ID:', PROJECT_ID);
  console.log('');
  console.log('=== MANUAL STEPS TO DEPLOY FIRESTORE RULES ===');
  console.log('');
  console.log('Since the Firebase CLI does not have the correct IAM permissions,');
  console.log('please deploy the rules manually via the Firebase Console:');
  console.log('');
  console.log('1. Go to: https://console.firebase.google.com/project/' + PROJECT_ID + '/firestore/rules');
  console.log('2. Click on the rules editor');
  console.log('3. Replace ALL the rules with the content below:');
  console.log('');
  console.log('--- BEGIN RULES ---');
  console.log(rules);
  console.log('--- END RULES ---');
  console.log('');
  console.log('4. Click "Publish"');
  console.log('');
  console.log('These rules allow public READ access to all content collections,');
  console.log('which is required for the public website to load data.');
}

deployRulesViaAPI();
