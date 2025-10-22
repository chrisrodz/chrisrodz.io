#!/usr/bin/env node

/**
 * Interactive CLI to generate properly formatted admin secret credentials
 *
 * This script generates a hashed password and salt for admin authentication.
 * The output values (ADMIN_SECRET_HASH and ADMIN_SECRET_SALT) should be
 * added to your .env file.
 *
 * Usage:
 *   node scripts/generate-admin-secret.js
 */

import { scryptSync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function printHeader() {
  console.log('\n' + colors.bright + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.blue + '  Admin Secret Generator' + colors.reset);
  console.log(colors.bright + colors.blue + '='.repeat(60) + colors.reset + '\n');
  console.log('This tool generates secure, hex-encoded credentials for admin authentication.\n');
}

function printInstructions() {
  console.log(colors.yellow + 'Instructions:' + colors.reset);
  console.log('1. Enter your desired admin password when prompted');
  console.log('2. Copy the generated values to your .env file');
  console.log('3. Never commit these values to version control\n');
}

/**
 * Validate hex-encoded string
 */
function isValidHex(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Generate hash and salt for a password
 */
function generateCredentials(password) {
  // Generate a random salt (32 bytes = 64 hex characters)
  const salt = randomBytes(32).toString('hex');

  // Hash the password with scrypt (64 bytes = 128 hex characters)
  const hash = scryptSync(password, salt, 64);
  const hashHex = hash.toString('hex');

  return { salt, hashHex };
}

/**
 * Prompt user for password with hidden input
 */
function promptPassword() {
  return new Promise((resolve) => {
    console.log(colors.cyan + 'Enter admin password:' + colors.reset);

    // Hide input by muting the output stream
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();

    let password = '';

    stdin.on('data', (char) => {
      char = char.toString('utf8');

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          console.log(); // New line after hidden input
          resolve(password);
          return;
        case '\u0003': // Ctrl-C
          console.log('\n\nCancelled.\n');
          process.exit(0);
        case '\u007f': // Backspace
          password = password.slice(0, -1);
          break;
        default:
          password += char;
          break;
      }
    });
  });
}

/**
 * Confirm password matches
 */
function confirmPassword() {
  return new Promise((resolve) => {
    console.log(colors.cyan + 'Confirm admin password:' + colors.reset);

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();

    let password = '';

    stdin.on('data', (char) => {
      char = char.toString('utf8');

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          console.log();
          resolve(password);
          return;
        case '\u0003': // Ctrl-C
          console.log('\n\nCancelled.\n');
          process.exit(0);
        case '\u007f': // Backspace
          password = password.slice(0, -1);
          break;
        default:
          password += char;
          break;
      }
    });
  });
}

/**
 * Print the generated credentials
 */
function printCredentials(salt, hashHex) {
  console.log(
    '\n' +
      colors.bright +
      colors.green +
      '✓ Credentials generated successfully!' +
      colors.reset +
      '\n'
  );

  // Validate output format
  if (!isValidHex(salt)) {
    console.error(colors.yellow + 'Warning: Generated salt is not valid hex format' + colors.reset);
  }
  if (!isValidHex(hashHex)) {
    console.error(colors.yellow + 'Warning: Generated hash is not valid hex format' + colors.reset);
  }

  console.log(colors.bright + 'Add these to your .env file:' + colors.reset + '\n');
  console.log(colors.cyan + 'ADMIN_SECRET_SALT=' + colors.reset + salt);
  console.log(colors.cyan + 'ADMIN_SECRET_HASH=' + colors.reset + hashHex);

  console.log('\n' + colors.yellow + 'Security notes:' + colors.reset);
  console.log('• Keep these values secret and never commit them to version control');
  console.log('• The .env file should be in your .gitignore');
  console.log('• Use different credentials for different environments');
  console.log("• Store production credentials in your deployment platform's secrets\n");

  console.log(colors.bright + 'Format validation:' + colors.reset);
  console.log(`• Salt length: ${salt.length} characters (${salt.length / 2} bytes)`);
  console.log(`• Hash length: ${hashHex.length} characters (${hashHex.length / 2} bytes)`);
  console.log(
    `• Salt format: ${isValidHex(salt) ? colors.green + '✓ Valid hex' : colors.yellow + '✗ Invalid'} ${colors.reset}`
  );
  console.log(
    `• Hash format: ${isValidHex(hashHex) ? colors.green + '✓ Valid hex' : colors.yellow + '✗ Invalid'} ${colors.reset}`
  );
  console.log();
}

/**
 * Main function
 */
async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    printHeader();
    printInstructions();

    // Prompt for password
    const password = await promptPassword(rl);

    if (!password || password.length < 8) {
      console.error(
        colors.yellow + '\nError: Password must be at least 8 characters long' + colors.reset + '\n'
      );
      process.exit(1);
    }

    // Confirm password
    const confirmPass = await confirmPassword(rl);

    if (password !== confirmPass) {
      console.error(colors.yellow + '\nError: Passwords do not match' + colors.reset + '\n');
      process.exit(1);
    }

    // Generate credentials
    const { salt, hashHex } = generateCredentials(password);

    // Print results
    printCredentials(salt, hashHex);
  } catch (error) {
    console.error('\n' + colors.yellow + 'Error:', error.message + colors.reset + '\n');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
