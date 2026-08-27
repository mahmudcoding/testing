import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // ground truth: membership + archived flag for each channel
  const truth = await page.evaluate(async ()=>{
    const g = async u => { const x=await fetch(u,{credentials:'include'}); let b=null; try{b=await x.json()}catch{} return {s:x.status,b}; };
    const me = await g('/api/v1/auth/me');
    const myId = me.b?.id||me.b?.user?.id;
    const ids={'qa-general':'C4QEGENERAL0001','qa-private':'C4QEPRIVATE0001','qa-archived':'C4QEARCHIVE0001','e-arch-probe-2353':'C4OX3463S8ECN8X'};
    const out={};
    for(const [n,id] of Object.entries(ids)){
      const c=await g(`/api/v1/channels/${id}`);
      const m=await g(`/api/v1/channels/${id}/members`);
      const arr=m.b?.members||m.b?.data||(Array.isArray(m.b)?m.b:[]);
      const ch=c.b?.channel||c.b;
      out[n]={type:ch?.type, archived: ch?.is_archived ?? ch?.archived ?? null,
              iAmMember: (Array.isArray(arr)?arr:[]).some(x=>(x.user_id||x.id||x.user?.id)===myId),
              memberCount: Array.isArray(arr)?arr.length:null};
    }
    return {myId: myId? 'ok':'??', channels: out};
  });
  // now the UI query matrix
  const caught=[];
  const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    caught.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      total_channels:b?.total_channels, channels:(b?.channels||[]).map(c=>c.name)}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2500);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  for (const q of ['qa','general','private','archived','probe','e-arch','qa-arch']) {
    await inp.fill(''); await page.waitForTimeout(400);
    await inp.type(q,{delay:40}); await page.waitForTimeout(3000);
  }
  page.off('response',h);
  const byQ={}; for(const c of caught) if(c.q) byQ[c.q]=c;
  return {truth, matrix: Object.values(byQ)};
};
