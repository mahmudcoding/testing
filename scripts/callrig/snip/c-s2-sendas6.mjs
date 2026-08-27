const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push({post:(r.postData()||'')}); });
  const chip = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Send as /.test(x.getAttribute('aria-label')||''));
    let chipBox=b; for(let i=0;i<4&&chipBox;i++) chipBox=chipBox.parentElement;
    return {tag, label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null,
      chipText: chipBox? chipBox.innerText.replace(/\n+/g,' | ').slice(0,110):null,
      chipImgs: chipBox? chipBox.querySelectorAll('img').length:0,
      chipSvgs: chipBox? chipBox.querySelectorAll('svg').length:0};
  }, t);
  const out={};
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
  await page.waitForTimeout(5000);
  out.photoMode = await chip('photo-mode');
  await page.locator('button[aria-label="Send as file"]').first().click({timeout:8000});
  await page.waitForTimeout(1500);
  out.fileMode = await chip('file-mode');
  await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
  await page.waitForTimeout(5500);
  out.request = reqs.map(r=>r.post.slice(0,200));
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {imgs:el.querySelectorAll('img').length, text:el.innerText.replace(/\n+/g,' | ').slice(0,70)};
  });
  return out;
};
