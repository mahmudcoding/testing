export default async ({page}) => {
  return await page.evaluate(() => {
    const w = window.__ws || {sent:[],recv:[]};
    const st=[...document.querySelectorAll('[role="status"]')].map(e=>({t:(e.textContent||'').trim().slice(0,60),
      h: Math.round(e.getBoundingClientRect().height), cls:(e.className||'').slice(0,40)}));
    return {sentAll: w.sent.map(x=>x.d), recvAll: w.recv.map(x=>x.d),
            typingRecv: w.recv.filter(x=>/typing/i.test(x.d)).map(x=>x.d),
            statusRows: st, url: location.href, vis: document.visibilityState};
  });
};
