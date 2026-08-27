const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out = await page.evaluate((vs)=>{const vis=eval(vs);
    const inv=[...document.body.querySelectorAll('*')].find(e=>vis(e)&&/invited you to join/i.test(e.innerText||'')&&e.children.length<=6);
    const near = inv? [...(inv.closest('div')?.parentElement||inv).querySelectorAll('button')].filter(vis)
        .map(b=>({t:(b.innerText||'').trim().slice(0,22),al:(b.getAttribute('aria-label')||'').slice(0,24)})) : [];
    return { inviteBlock: inv? (inv.innerText||'').replace(/\s+/g,' ').slice(0,120):null,
      nearButtons: near,
      allButtons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-invite-ui.png'});
  return out;
};
