import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const jar = resolve('mobile/android/gradle/wrapper/gradle-wrapper.jar');
const encoded = resolve('mobile/android/gradle/wrapper/gradle-wrapper.jar.b64');
if (!existsSync(jar)) {
  writeFileSync(jar, Buffer.from(readFileSync(encoded, 'utf8').replace(/\s/g, ''), 'base64'));
  console.log('Restored Gradle wrapper.');
}
console.log('Android project is ready. Run: npm run android:sync');
