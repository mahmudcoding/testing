import {WS, BASE} from './e-p2-helpers.mjs';
const active = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return null;
  const id=(d.querySelector('[aria-activedescendant]')||{getAttribute:()=>null}).getAttribute('aria-activedescendant');
  const n=id?document.getElementById(id):null;
  return n? (n.textContent||'').replace(/\s+/g,' ').replace(/^Open message /,'').slice(0,44) : null;
};
export default async ({page, browser}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600);
  const highlighted = await page.evaluate(active);
  const tabsBefore = page.context().pages().length;
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const url = page.url();
  const mid = (url.match(/[?&]m=([^&]+)/)||[])[1] || null;
  // resolve that id back to its body and compare with what was highlighted
  const resolved = mid ? await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/messaging/channels/C4QEGENERAL0001/messages?limit=100`,{credentials:'include'});
    const b=await r.json(); const arr=b.messages||b.data||[];
    const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===id);
    return m? (m.body||'').slice(0,44) : 'NOT FOUND IN CHANNEL';
  }, mid) : null;
  return {highlightedRow:highlighted, openedMessageId: mid? 'captured':null,
    openedMessageBody:resolved, tabsBefore, tabsAfter: page.context().pages().length,
    url:url.replace(/https?:\/\/[^/]+/,'').replace(/m=[^&]+/,'m=<id>')};
};
