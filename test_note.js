/**
 * TEST SUITE: HiHi Note (note)
 * Kiểm thử toàn diện chức năng & bảo mật
 */

const fs = require('fs');
const path = require('path');

const results = [];
function recordResult(name, passed, details) {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ DỰ ÁN: note (HiHi Note)');
  console.log('====================================================\n');

  const dir = __dirname;
  const indexPath = path.join(dir, 'index.html');
  const swPath = path.join(dir, 'sw.js');

  // TEST 1: Cấu trúc file
  try {
    const hasIndex = fs.existsSync(indexPath);
    const hasSw = fs.existsSync(swPath);
    recordResult('1. Cấu trúc file cơ bản', hasIndex && hasSw, `index.html: ${hasIndex}, sw.js: ${hasSw}`);
  } catch (e) {
    recordResult('1. Cấu trúc file cơ bản', false, e.message);
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  // TEST 2: Kiểm tra lỗi escape literal \n trong HTML
  try {
    const hasLiteralSlashN = html.includes('</a>\\n');
    const passed = !hasLiteralSlashN;
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', passed, passed ? 'HTML sạch sẽ, không có lỗi chuỗi escape' : 'Phát hiện literal "\\n" trong mã HTML');
  } catch (e) {
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', false, e.message);
  }

  // TEST 3: Bảo mật liên kết ngoài target="_blank"
  try {
    const lines = html.split('\n');
    const violations = [];
    lines.forEach((l, idx) => {
      if (l.includes('target="_blank"') && !l.includes('noopener')) {
        violations.push(`Dòng ${idx+1}: ${l.trim()}`);
      }
    });
    const passed = violations.length === 0;
    recordResult('3. Bảo mật thẻ liên kết ngoài (target="_blank" rel="noopener noreferrer")', passed, passed ? 'Tất cả liên kết ngoài an toàn' : `Phát hiện ${violations.length} liên kết thiếu rel="noopener"`);
  } catch (e) {
    recordResult('3. Bảo mật thẻ liên kết ngoài', false, e.message);
  }

  // TEST 4: Kiểm tra kết nối Cloudflare Storage (/data)
  try {
    const t0 = Date.now();
    const res = await fetch('https://luuhihi.ngxuanhai123.workers.dev/data');
    const lat = Date.now() - t0;
    const data = await res.json();
    const passed = res.status === 200 && Array.isArray(data.notes);
    recordResult('4. Kết nối Cloudflare Storage (/data)', passed, `Status: ${res.status}, Latency: ${lat}ms, Notes count: ${data.notes?.length || 0}`);
  } catch (e) {
    recordResult('4. Kết nối Cloudflare Storage (/data)', false, e.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${results.length} bài test vượt qua`);
  console.log('====================================================\n');
}

runTests();
