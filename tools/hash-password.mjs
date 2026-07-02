// Generate the password hash to store as the SILKY_PASSWORD_HASH secret.
// Usage:  node tools/hash-password.mjs "her-chosen-password"
import { hashPassword } from '../src/lib/auth.js';

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node tools/hash-password.mjs "password"');
  process.exit(1);
}
const hash = await hashPassword(pw);
console.log('\nSILKY_PASSWORD_HASH=' + hash + '\n');
console.log('Local: put the line above in .dev.vars');
console.log('Prod:  npx wrangler pages secret put SILKY_PASSWORD_HASH');
