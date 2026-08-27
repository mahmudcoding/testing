const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', r=>{ net.push({u:r.url().replace('https://airion-cargo.store',''). slice(0,70), s:r.status()}); });
  const routes = ['/w/W4QAF1XTURESO01/settings/admin/invites',
                  '/w/W4QAF1XTURESO01/settings/admin/members',
                  '/w/W4QAF1XTURESO01/settings/admin/company',
                  '/w/W4QAF1XTURESO01/settings/admin/workspaces',
                  '/w/W4QAF1XTURESO01/settings/admin/audit',
                  '/w/W4QAF1XTURESO01/chat/mentions'];
  out.routes={};
  for(const rt of routes){
    net.length=0;
    await page.goto('https://airion-cargo.store'+rt,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    const txt = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,90));
    out.routes[rt.split('/settings/')[1]||rt.split('/w/W4QAF1XTURESO01')[1]] = {
      bodyHead: txt, bad: net.filter(n=>n.s>=500).map(n=>`${n.s} ${n.u}`).slice(0,4) };
  }
  return out;
};
