import { purgeExpiredAction } from '../src/app/actions/purge';

async function test() {
    try {
        console.log('Running purge action...');
        const res = await purgeExpiredAction();
        console.log('Purge Res:', res);
    } catch (e: any) {
        console.error('Purge FAILED:', e.message);
    }
}

test();
