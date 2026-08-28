export default async ({page}) => {
  const steps=[];
  // Mute the synthetic mic first — no need to put a test tone into a live call.
  const mic = page.getByRole('button',{name:/^Microphone on$/}).first();
  if (await mic.count()) { await mic.click({timeout:8000}).catch(()=>steps.push('mic err')); await page.waitForTimeout(1500); }
  steps.push('mic now: '+await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^microphone/i.test(x.getAttribute('aria-label')||x.textContent||''));return b?(b.textContent||'').trim():'?';}));
  await page.getByRole('button',{name:/^Join$/}).first().click({timeout:10000}).catch(e=>steps.push('join err'));
  await page.waitForTimeout(14000);
  steps.push('inCall: '+await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')));
  steps.push('state: '+await page.evaluate(()=>(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,160)));
  return steps;
};
