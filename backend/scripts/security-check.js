#!/usr/bin/env node
/**
 * Security Check Script
 * Verifies security configuration and identifies potential vulnerabilities
 * 
 * Run: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Security Check Script');
console.log('========================\n');

let issues = [];
let warnings = [];
let passed = [];

// Check 1: Environment variables file exists
function checkEnvFile() {
  console.log('📋 Checking environment configuration...');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    issues.push('.env file not found');
  } else {
    passed.push('.env file exists');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for exposed secrets
    const sensitivePatterns = [
      { pattern: /NEXT_PUBLIC_DATABASE_URL/i, desc: 'DATABASE_URL exposed as NEXT_PUBLIC_' },
      { pattern: /NEXT_PUBLIC_JWT_SECRET/i, desc: 'JWT_SECRET exposed as NEXT_PUBLIC_' },
      { pattern: /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/i, desc: 'SERVICE_ROLE_KEY exposed as NEXT_PUBLIC_' },
    ];
    
    for (const { pattern, desc } of sensitivePatterns) {
      if (pattern.test(envContent)) {
        issues.push(`CRITICAL: ${desc}`);
      }
    }
    
    // Check if JWT_SECRET is set
    if (!/JWT_SECRET=.+/.test(envContent)) {
      issues.push('JWT_SECRET not set');
    } else {
      const match = envContent.match(/JWT_SECRET=(.+)/);
      if (match && match[1].length < 32) {
        warnings.push('JWT_SECRET is shorter than recommended (32 chars)');
      } else {
        passed.push('JWT_SECRET meets length requirements');
      }
    }
    
    // Check if DATABASE_URL is set
    if (!/DATABASE_URL=.+/.test(envContent)) {
      issues.push('DATABASE_URL not set');
    } else {
      passed.push('DATABASE_URL is configured');
    }
    
    // Check for production SSL
    if (/NODE_ENV=production/.test(envContent)) {
      if (!/DB_SSL_REJECT_UNAUTHORIZED=true/.test(envContent)) {
        warnings.push('Production mode without SSL certificate validation');
      }
    }
  }
  
  if (!fs.existsSync(envExamplePath)) {
    warnings.push('.env.example template not found');
  } else {
    passed.push('.env.example template exists');
  }
}

// Check 2: Gitignore contains sensitive files
function checkGitignore() {
  console.log('📋 Checking .gitignore configuration...');
  
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    issues.push('.gitignore file not found');
    return;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  
  const requiredPatterns = [
    { pattern: /\.env/, desc: '.env files' },
    { pattern: /node_modules/, desc: 'node_modules' },
  ];
  
  for (const { pattern, desc } of requiredPatterns) {
    if (pattern.test(content)) {
      passed.push(`${desc} in .gitignore`);
    } else {
      issues.push(`${desc} NOT in .gitignore`);
    }
  }
}

// Check 3: Package.json dependencies
function checkDependencies() {
  console.log('📋 Checking security dependencies...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    issues.push('package.json not found');
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const securityDeps = [
    { name: 'helmet', desc: 'Security headers' },
    { name: 'express-rate-limit', desc: 'Rate limiting' },
    { name: 'hpp', desc: 'HTTP Parameter Pollution prevention' },
    { name: 'zod', desc: 'Input validation' },
    { name: 'bcryptjs', alt: 'bcrypt', desc: 'Password hashing' },
    { name: 'jsonwebtoken', desc: 'JWT authentication' },
  ];
  
  for (const { name, alt, desc } of securityDeps) {
    if (deps[name] || (alt && deps[alt])) {
      passed.push(`${desc} (${name}) installed`);
    } else {
      warnings.push(`${desc} (${name}) not found`);
    }
  }
}

// Check 4: Source code security patterns
function checkSourceCode() {
  console.log('📋 Checking source code patterns...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    issues.push('src directory not found');
    return;
  }
  
  // Check for security files
  const securityFiles = [
    { path: 'lib/env.ts', desc: 'Environment validation' },
    { path: 'lib/security.ts', desc: 'Security utilities' },
    { path: 'lib/validations.ts', desc: 'Input validation schemas' },
    { path: 'middlewares/security.middleware.ts', desc: 'Security middleware' },
    { path: 'middlewares/audit.middleware.ts', desc: 'Audit logging' },
  ];
  
  for (const { path: filePath, desc } of securityFiles) {
    const fullPath = path.join(srcDir, filePath);
    if (fs.existsSync(fullPath)) {
      passed.push(`${desc} file exists`);
    } else {
      warnings.push(`${desc} file not found`);
    }
  }
}

// Check 5: CORS configuration
function checkCORSConfig() {
  console.log('📋 Checking CORS configuration...');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    return;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  
  if (/CORS_ORIGIN=\*/.test(content)) {
    if (/NODE_ENV=production/.test(content)) {
      issues.push('CORS allows all origins (*) in production');
    } else {
      warnings.push('CORS allows all origins (*) - ok for development');
    }
  } else if (/CORS_ORIGIN=/.test(content)) {
    passed.push('CORS origins configured');
  }
}

// Run all checks
function runChecks() {
  checkEnvFile();
  checkGitignore();
  checkDependencies();
  checkSourceCode();
  checkCORSConfig();
  
  // Summary
  console.log('\n📊 Security Check Summary');
  console.log('=========================\n');
  
  if (passed.length > 0) {
    console.log('✅ PASSED:');
    passed.forEach(msg => console.log(`   • ${msg}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(msg => console.log(`   • ${msg}`));
    console.log();
  }
  
  if (issues.length > 0) {
    console.log('❌ ISSUES (must fix):');
    issues.forEach(msg => console.log(`   • ${msg}`));
    console.log();
  }
  
  const total = passed.length + warnings.length + issues.length;
  const score = Math.round((passed.length / total) * 100);
  
  console.log(`📈 Security Score: ${score}%`);
  console.log(`   Passed: ${passed.length}/${total}`);
  console.log(`   Warnings: ${warnings.length}`);
  console.log(`   Issues: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 Please fix all issues before deploying to production!');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Consider addressing warnings before production.');
    process.exit(0);
  } else {
    console.log('\n🎉 All security checks passed!');
    process.exit(0);
  }
}

runChecks();
