import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixTests = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixTests(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from '@safe-link-checker\/(.*?)\/index\.js'/g, "from '@safe-link-checker/$1'");
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
fixTests(path.join(__dirname, 'safe-link-checker/tests'));
