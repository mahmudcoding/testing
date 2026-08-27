export default async ({page}) => {
  return await page.evaluate(() => {
    const keys=['can_manage_chat','can_manage_microphone','can_manage_camera','can_manage_screen_share','can_pin_video','can_manage_reactions','can_approve_requests','can_kick_participants','can_mute_participants','can_assign_admins','can_manage_breakout_rooms','can_manage_recording','can_manage_meeting_settings'];
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    const out={};
    for (const k of keys){ const b=document.querySelector('[data-testid="admin-permission-'+k+'"]'); out[k]= b? (b.checked?'CHECKED':'unchecked') : 'MISSING'; }
    return {dialogText: m?m.innerText.replace(/\n+/g,' | ').slice(0,300):null, boxes: out,
      submit: (s=>s?{l:s.innerText.trim(), dis:s.disabled}:null)(document.querySelector('[data-testid="admin-permissions-submit"]'))};
  });
};
