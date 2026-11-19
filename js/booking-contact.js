(() => {
  const API = 'https://risuan-checkout.vercel.app';
  const root = document.getElementById('booking-contact-root');
  const params = new URLSearchParams(location.search);
  const id = params.get('bookingId') || '';
  const key = 'risuan-booking-contact:' + id;
  let token = params.get('token') || '';
  try { if (token) sessionStorage.setItem(key, token); else token = sessionStorage.getItem(key) || ''; } catch {}
  const share = new URL(location.pathname, location.origin); share.searchParams.set('bookingId', id); share.searchParams.set('token', token);
  history.replaceState(null, '', location.pathname + '?bookingId=' + encodeURIComponent(id));
  const escape = text => String(text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const field=document.createElement('textarea'); field.value=text; field.readOnly=true; field.className='booking-contact-copy-helper'; document.body.append(field);
      try { field.focus(); field.select(); return document.execCommand('copy'); } catch { return false; } finally { field.remove(); }
    }
  }
  async function load() {
    if (!id || !token) { root.textContent = '連結不完整，請從提醒信重新開啟，或請主要聯絡人分享同行者連結。'; return; }
    try {
      const res = await fetch(API + '/api/account?action=booking-contact-info&bookingId=' + encodeURIComponent(id), {cache:'no-store', headers:{'X-Booking-Access':token}});
      const data = await res.json(); if (!res.ok) throw Error(data.error || '預約資料暫時無法載入');
      const text = ['您好，我想確認課前圖片與準備：','預約編號：'+data.bookingId,'主要聯絡人：'+data.name,'預約者 IG：'+(data.ig || '未填寫'),'上課日期：'+data.date+' '+data.time,'課程：'+data.course,'人數：'+data.qty,'我的姓名（同行者請補充）：','想討論的圖片／問題：'].join('\n');
      const rows=[['預約編號',data.bookingId],['主要聯絡人',data.name],['預約者 IG／FB',data.ig || '未填寫'],['上課日期',data.date+' '+data.time],['課程',data.course],['人數',data.qty]];
      root.innerHTML = `<div class="booking-contact-card"><h2 class="booking-contact-card__title">先複製，再私訊</h2><p class="booking-contact-card__text">資料已整理完成，不需要填寫。請按下方按鈕複製，再到 IG 貼上私訊。同行者也可複製同一筆資料，貼上後補充自己的姓名。</p><div class="booking-contact-actions"><button type="button" class="booking-contact-button booking-contact-button--primary" data-copy-booking>1. 複製預約資料</button><a class="booking-contact-button booking-contact-card__instagram" href="https://www.instagram.com/ri.suan_art/" target="_blank" rel="noopener noreferrer">2. 開啟 IG 私訊</a></div><p class="booking-contact-feedback" role="status" tabindex="-1" hidden data-copy-status></p><p class="booking-contact-summary-label">將複製以下預約資料</p><dl class="booking-contact-summary">${rows.map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>${Number(data.qty)>1?'<section class="booking-contact-companions"><h3 class="booking-contact-card__title">同行者都使用 IG，建議建立群組</h3><p class="booking-contact-card__text">請主要聯絡人先私訊畫室核對帳號，再把同行朋友和 <a class="booking-contact-handle" href="https://www.instagram.com/ri.suan_art/" target="_blank" rel="noopener noreferrer">@ri.suan_art</a> 一起加入群組。我們會提供資訊、回答問題，協助確認課程內容、材料與圖片，省去逐一轉述。</p><button type="button" class="booking-contact-button" data-copy-share>複製同行者連結</button></section>':''}</div>`;
      const status=root.querySelector('[data-copy-status]');
      function showFeedback(message) { status.textContent=message; status.hidden=false; status.focus({preventScroll:true}); status.scrollIntoView({behavior:'smooth',block:'nearest'}); }
      root.querySelector('[data-copy-booking]').addEventListener('click', async () => {
        const copied=await copy(text);
        if (!copied) { const range=document.createRange(); range.selectNodeContents(root.querySelector('.booking-contact-summary')); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
        showFeedback(copied?'已複製！接著按「2. 開啟 IG 私訊」，把資料貼到私訊或群組中。':'目前無法自動複製，請長按下方預約摘要全選並複製，再開啟 IG。');
      });
      root.querySelector('[data-copy-share]')?.addEventListener('click', async () => {
        showFeedback(await copy(share.href)?'同行者連結已複製！可貼給同一筆預約的朋友，讓他們複製資料。':'目前無法自動複製連結，請由主要聯絡人先複製預約資料並轉傳朋友。');
      });
    } catch (error) { root.textContent = error.message + '，請從提醒信重新開啟，或請主要聯絡人重新分享連結。'; }
  }
  load();
})();
