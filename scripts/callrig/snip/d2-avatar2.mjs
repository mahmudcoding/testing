export default async ({page}) => {
  const WS='W4QDF1XTURESO01', path=process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const snap = (tag) => page.evaluate((tag)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const d=document.querySelector('[role=dialog],[role=alertdialog]');
    const m=document.querySelector('main')||document.body;
    return {tag, dialog: d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,220),
              btns:[...d.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').trim().slice(0,20)}`)}:null,
      mainBtns:[...m.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)}`),
      fileValue: (()=>{const i=m.querySelector('input[type=file]'); return i? (i.files?i.files.length:'?') : 'no-input';})(),
      txtTail:(m.innerText||'').replace(/\s+/g,' ').slice(0,260)};
  }, tag);
  const out={before: await snap('before')};
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET') reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('main input[type=file]').first().setInputFiles(path);
  await page.waitForTimeout(2500);
  out.after2s = await snap('after2s');
  await page.waitForTimeout(6000);
  out.after8s = await snap('after8s');
  page.off('response', on);
  out.reqs = reqs;
  out.consoleErrors = null;
  return out;
};
