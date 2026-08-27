import { watchNotices, safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  const btn='main button:has-text("Resend invite")';
  out.found = await page.locator(btn).count();
  if(!out.found) return out;
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET') reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.first = await watchNotices(page,{ms:9000, trigger: async()=>{ out.click1 = await safeClick(page, btn); }});
  out.reqs1 = reqs.filter(r=>!/rum/.test(r)); reqs.length=0;
  // immediately again — the contract says one resend per 60 s
  out.second = await watchNotices(page,{ms:9000, trigger: async()=>{ out.click2 = await safeClick(page, btn); }});
  page.off('response', on);
  out.reqs2 = reqs.filter(r=>!/rum/.test(r));
  return out;
};
