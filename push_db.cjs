const { execSync } = require('child_process');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // Replace 6543 with 5432 and remove pgbouncer=true for direct connection
  const directUrl = dbUrl.replace(':6543', ':5432').replace('?pgbouncer=true', '');
  console.log("Using direct URL for push...");
  execSync('npx prisma db push', { 
    env: { ...process.env, DATABASE_URL: directUrl }, 
    stdio: 'inherit' 
  });
} else {
  console.log("No DATABASE_URL found");
}
