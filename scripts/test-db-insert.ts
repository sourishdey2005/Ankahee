import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
  const matchUrl = envLocal.match(/^TURSO_DATABASE_URL="?([^"\n\r]+)"?/m);
  const matchToken = envLocal.match(/^TURSO_AUTH_TOKEN="?([^"\n\r]+)"?/m);
  
  const url = matchUrl ? matchUrl[1].trim() : '';
  const authToken = matchToken ? matchToken[1].trim() : '';

  const client = createClient({ url, authToken });

  console.log('Testing INSERT on room_members...');
  try {
     const res = await client.execute({
        sql: "insert into \"room_members\" (\"room_id\", \"user_id\", \"created_at\") values (?, ?, (strftime('%s', 'now') * 1000))",
        args: [1, "test_user"]
     });
     console.log('Insert success:', res);
  } catch (err: any) {
     console.error('Insert error details:', err.message);
     console.error('Error Code:', err.code);
  }
  
  process.exit(0);
}

main();
