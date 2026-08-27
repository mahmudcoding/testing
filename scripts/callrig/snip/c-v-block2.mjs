// Finding 1: card of an ALREADY-blocked person. Same-session reopen, then hard fresh load.
// Enumerate every interactive node, and probe for an overflow menu hiding an Unblock.
const VIS = `(e)=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
  let n=e,o=1; while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false;
  o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;}`;

const CARD = `(()=>{const vis=${VIS};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
  if(!d) return {noDialog:true};
  const inter=[...d.querySelectorAll('button,a[href],[role=button],[role=menuitem],[role=switch],input,select,[tabindex]:not([tabindex="-1"])')]
    .filter(vis).map(e=>({tag:e.tagName, l:(e.getAttribute('aria-label')||e.innerText||e.value||'').replace(/\\s+/g,' ').trim().slice(0,45), dis:!!e.disabled||e.getAttribute('aria-disabled')==='true'}));
  const anyUnblock=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/unblock/i.test(e.textContent||''))
    .map(e=>({tag:e.tagName, t:(e.textContent||'').trim().slice(0,40), visible:vis(e)}));
  return {text:d.innerText.replace(/\\s+/g,' ').slice(0,420), interactive:inter, unblockNodesAnywhereInDom:anyUnblock};
})()`;

export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};

  // A) reopen in the SAME session, no reload
  const close = async () => { const c=page.locator('[role=dialog] button[aria-label="Close profile"]').first();
    if(await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(1000);} };
  await close();
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(2500);
  out.sameSessionReopen = await page.evaluate(CARD);

  // B) hard fresh load, then open the card
  await close();
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(5000);
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(3000);
  out.freshLoad = await page.evaluate(CARD);

  // C) control: a person who was never blocked, same fresh page
  await close();
  await page.locator('main').getByText('QA Dave',{exact:true}).first().click();
  await page.waitForTimeout(2500);
  out.controlNeverBlocked = await page.evaluate(CARD);
  return out;
};
