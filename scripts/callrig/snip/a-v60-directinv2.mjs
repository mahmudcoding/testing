const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/member|invit|user/i.test(u)&&r.request().method()==='GET'){
    let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({u:u.split('/api/v1/')[1]?.slice(0,60),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const sb = await page.$('input[placeholder="Search company members"]');
  const probe = async (q) => {
    await sb.click({clickCount:3}); await page.keyboard.press('Backspace');
    if(q) await page.keyboard.type(q,{delay:55});
    await page.waitForTimeout(2600);
    return await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      const t=(m.innerText||'').replace(/\s+/g,' ');
      const names=[...new Set((t.match(/QA [A-Z][a-z]+/g)||[]))];
      return { namesOnPage:names, emptyMsg:(t.match(/No (company )?members[^]{0,50}|Nothing[^]{0,40}/)||[''])[0],
        directTail:(t.match(/Direct invites[^]{0,260}/)||[''])[0].slice(-150) };},VS);
  };
  out.blank = await probe('');
  out.qa = await probe('QA');
  out.outs = await probe('Outsider');
  out.requests = net.filter(n=>/member/i.test(n.u||'')).slice(0,4);
  // ground truth: who is in the company but not the workspace?
  out.truth = await page.evaluate(async()=>{
    const co=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).json().catch(()=>null);
    const m=await fetch('/api/v1/workspaces/W4QAF1XTURESO01/members',{credentials:'include'});
    const mj=await m.json().catch(()=>null);
    const ws=(mj?.members||mj?.data||[]).map(x=>x.user_id||x.id);
    return { workspaceMemberCount:ws.length, companies:(co?.companies||co?.data||[]).length };});
  return out;
};
