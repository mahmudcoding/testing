export default async ({page}) => {
  const out = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const tabs = [...main.querySelectorAll('[role="tab"]')].map(b=>({t:b.textContent.trim().slice(0,24), sel:b.getAttribute('aria-selected')}));
    const all = [...main.querySelectorAll('button,a[href]')].filter(b=>b.offsetParent!==null);
    const loadmore = all.filter(b=>/load|more|show/i.test(b.textContent||'')).map(b=>b.textContent.trim().slice(0,30));
    const rowCount = main.querySelectorAll('[data-testid="recent-call-row"], [data-testid*="recent-call"]').length;
    // count call-like rows generically: list items under body
    const body = main.querySelector('[data-testid="calls-hub-body"]');
    const kids = body ? [...body.children].map(c=>({tag:c.tagName, tid:c.getAttribute('data-testid'), n:c.children.length, txt:(c.innerText||'').replace(/\n+/g,' | ').slice(0,120)})) : null;
    return {tabs, loadmore, rowCount, kids, headerBtns: all.slice(0,8).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30))};
  });
  return out;
};
