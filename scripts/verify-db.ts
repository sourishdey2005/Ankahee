import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
  const matchUrl = envLocal.match(/^TURSO_DATABASE_URL="?([^"\n\r]+)"?/m);
  const matchToken = envLocal.match(/^TURSO_AUTH_TOKEN="?([^"\n\r]+)"?/m);
  
  const client = createClient({ url: matchUrl![1].trim(), authToken: matchToken![1].trim() });

  const res = await client.execute("PRAGMA table_info(room_messages);");
  console.log('Columns in room_messages:');
  console.log(JSON.stringify(res.rows, null, 2));

  process.exit(0);
}

main();
