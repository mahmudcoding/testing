export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch = await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.channels||j.items||j))||[];
    const hit=(Array.isArray(a)?a:[]).filter(c=>/^qa-c2-sweep/.test(c.name||''))
      .sort((x,y)=>String(y.created_at||'').localeCompare(String(x.created_at||'')))[0];
    return hit?{id:hit.id,name:hit.name}:null;
  }, ws);
  if(!ch) return {error:'sweep channel not found'};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch.id}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const out={channel:ch.name};
  try { await page.locator('button').filter({hasText:/^Create role$/}).first().click({timeout:6000}); out.openForm='ok'; }
  catch(e){ out.openForm='FAIL'; return out; }
  await page.waitForTimeout(3500);
  out.formInputs=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('input,textarea')].filter(v)
      .map(e=>`${e.type||e.tagName.toLowerCase()}|ph="${(e.getAttribute('placeholder')||'').slice(0,26)}"|al="${(e.getAttribute('aria-label')||'').slice(0,22)}"`);
  });
  return out;
};
