
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
  async function copy(text, textarea) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      if (textarea) { textarea.focus(); textarea.select(); try { return document.execCommand('copy'); } catch {} }
      return false;
    }
  }
  async function load() {
    if (!id || !token) { root.textContent = '連結不完整，請從提醒信重新開啟，或請主要聯絡人分享同行者連結。'; return; }
    try {
      const res = await fetch(API + '/api/account?action=booking-contact-info&bookingId=' + encodeURIComponent(id), {cache:'no-store', headers:{'X-Booking-Access':token}});
      const data = await res.json(); if (!res.ok) throw Error(data.error || '預約資料暫時無法載入');
      const text = ['您好，我想確認課前圖片與準備：','預約編號：'+data.bookingId,'主要聯絡人：'+data.name,'預約者 IG：'+(data.ig || '未填寫'),'上課日期：'+data.date+' '+data.time,'課程：'+data.course,'人數：'+data.qty,'我的姓名（同行者請補充）：','想討論的圖片／問題：'].join('\n');
      root.innerHTML = `<div class="booking-contact-card"><h2 class="booking-contact-card__title">先複製，再私訊</h2><p class="booking-contact-card__text">請由主要聯絡人先聯繫畫室，方便核對預約與 IG 帳號。同行者也能複製同一筆資料，貼上後補充自己的姓名。</p><textarea class="booking-contact-card__copy" rows="10" readonly aria-label="預約聯絡資料">${escape(text)}</textarea><div class="booking-contact-card__actions"><button type="button" class="work__cta work__cta--primary" data-copy-booking>1. 複製預約資料</button><a class="work__cta booking-contact-card__instagram" href="https://www.instagram.com/ri.suan_art/" target="_blank" rel="noopener noreferrer">2. 開啟 IG 私訊</a></div><p class="booking-contact-card__status" aria-live="polite" data-copy-status></p>${Number(data.qty)>1?'<p class="booking-contact-card__text">多人都使用 IG 時，建議主要聯絡人建立群組，把同行朋友與 @ri.suan_art 一起加入。我們會在群組提供資訊、回答問題，協助確認課程內容、材料與圖片，省去逐一轉述。</p><button type="button" class="text-link" data-copy-share>複製同行者連結</button>':''}</div>`;
      const textarea = root.querySelector('textarea'), status = root.querySelector('[data-copy-status]');
      root.querySelector('[data-copy-booking]').addEventListener('click', async () => {
        status.textContent = await copy(text, textarea) ? '已複製，接著開啟 IG，把資料貼到私訊或群組中。' : '目前無法自動複製，請長按上方資料全選後複製，再開啟 IG。';
      });
      root.querySelector('[data-copy-share]')?.addEventListener('click', async () => {
        const field = document.createElement('textarea'); field.value=share.href; field.readOnly=true; root.append(field);
        const copied=await copy(share.href,field); field.remove();
        status.textContent=copied?'同行者連結已複製，可分享給同一筆預約的朋友，讓他們複製資料。':'目前無法自動複製連結，請由主要聯絡人先複製預約資料並轉傳朋友。';
      });
    } catch (error) { root.textContent = error.message + '，請從提醒信重新開啟，或請主要聯絡人重新分享連結。'; }
  }
  load();
})();
