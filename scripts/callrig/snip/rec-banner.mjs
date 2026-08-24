export default async ({page}) => {
  const r = await page.evaluate(async () => {
    const recs = await (await fetch('/api/v1/meeting/V4OS2FBRHQKDHV8/recordings',{credentials:'include'})).json();
    const hdr = document.querySelector('[data-testid="call-header-tabs"]');
    const banner = [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /recording/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,80));
    return {recStatus: (recs.recordings||[]).map(x=>x.status+':'+x.duration_sec+'s'),
            headerText: hdr? hdr.innerText.replace(/\n+/g,' | ') : null,
            recTexts: [...new Set(banner)].slice(0,8),
            badge: !!document.querySelector('[data-testid="call-recording-badge"]'),
            dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].map(d=>d.getAttribute('data-testid')+'::'+d.innerText.replace(/\n+/g,' | ').slice(0,200))};
  });
  return r;
};
