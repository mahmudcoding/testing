export default async ({page}) => {
  return await page.evaluate(async () => {
    const wc = document.querySelector('[data-testid="call-controls-waiting-count"]');
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    const w = await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/waiting',{credentials:'include'})).json();
    return {uiCount: wc ? wc.textContent.trim() : null,
            uiPresent: !!wc,
            toolbar: tb ? tb.innerText.replace(/\n+/g,'/').slice(0,90) : null,
            apiWaiting: (w.participants||[]).map(p=>p.name)};
  });
};
