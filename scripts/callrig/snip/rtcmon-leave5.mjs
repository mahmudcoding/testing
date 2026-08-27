export default async ({page}) => {
  const steps = [];
  const btn = page.getByRole('button', { name: /^Leave$/ }).first();
  steps.push('leave-confirm count: ' + await btn.count());
  await btn.click({ timeout: 10000 }).catch(e => steps.push('click err: ' + e.message.split('\n')[0]));
  await page.waitForTimeout(7000);
  steps.push('still in call: ' + await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')));
  steps.push('url: ' + await page.evaluate(()=>location.pathname));
  return steps;
};
