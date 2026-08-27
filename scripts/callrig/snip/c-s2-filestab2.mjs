const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  out.apiFiles = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json();
    const files=(j.messages||[]).flatMap(m=>(m.files||[]).map(f=>({n:f.filename, mime:f.mime_type})));
    return {count:files.length, byMime: files.reduce((a,f)=>{a[f.mime]=(a[f.mime]||0)+1; return a;},{}), names:files.map(f=>f.n).slice(0,8)};
  }, GEN);
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  await page.locator('[role="tab"]').filter({hasText:/^Files/}).first().click({timeout:8000});
  await page.waitForTimeout(3000);
  out.tab = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const panels=[...document.querySelectorAll('[role="tabpanel"]')].filter(vis);
    const p=panels[panels.length-1]||document.body;
    return {counts:(p.innerText.match(/(All|Images|Video|Audio|Documents) \(\d+\)/g)||[]),
      text:p.innerText.replace(/\n+/g,' | ').slice(0,260)};
  });
  // open the Audio category if it has anything
  try { await page.locator('button:visible').filter({hasText:/^Audio \(/}).first().click({timeout:6000});
        await page.waitForTimeout(2000);
        out.audio = await page.evaluate(()=>{
          const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
          const panels=[...document.querySelectorAll('[role="tabpanel"]')].filter(vis);
          const p=panels[panels.length-1]||document.body;
          return p.innerText.replace(/\n+/g,' | ').slice(0,200);
        }); } catch(e){ out.audioErr=String(e).slice(0,60); }
  return out;
};
