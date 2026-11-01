(function () {
  const root = document.querySelector('.custom-topics');
  if (!root) return;
  const topics = [
  {
    "key": "portrait",
    "label": "人像／合照／婚紗",
    "desc": "很適合當作送禮或自己留念的主題，尤其是婚紗、情侶合照。",
    "detail": "單堂通常會把重點放在臉部五官，背景、禮服、字樣等再依時間慢慢處理；如果背景比較複雜、人數比較多，或想要畫面更完整細緻，通常會建議規劃兩堂以上。",
    "images": []
  },
  {
    "key": "landscape",
    "label": "風景",
    "desc": "是很多沒有畫畫經驗的人會選的入門主題，天空加上海或山景是新手很容易上手的組合，顏色可以自己調整成喜歡的樣子。有時候只是一棵樹的剪影，也能撐起一整幅畫面。",
    "detail": "單堂大約三小時可以完成，想畫更多細節的話時間也會拉長一些。",
    "images": [
      {
        "src": "../../assets/images/gallery/landscape-oil/01.jpg",
        "alt": "油畫的開啟窗景，窗外是飄落櫻花瓣的枯枝樹林"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/09.jpg",
        "alt": "油畫的黃昏孤樹剪影，橘粉漸層天空搭配單一色系樹枝"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/02.jpg",
        "alt": "油畫的林蔭道路景色，一輛露營車行駛其中"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/06.jpg",
        "alt": "油畫的棕櫚樹庭院景色，粉色大門搭配仙人掌造景"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/07.jpg",
        "alt": "油畫的夕陽海景，金黃天空下山巒剪影倒映在海面上"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/08.jpg",
        "alt": "黑白色調油畫的港邊帆船，山巒剪影倒映在平靜水面"
      }
    ]
  },
  {
    "key": "disney",
    "label": "迪士尼／皮克斯",
    "desc": "從熟悉的角色開始，挑一張自己喜歡的畫面，和老師一起評估構圖與難度，再用油畫筆觸完成屬於自己的版本。",
    "detail": "<a class=\"text-link\" href=\"../../guides/disney-pixar-reference-guide/\">迪士尼／皮克斯怎麼選圖？</a>",
    "images": [
      {
        "src": "../../assets/images/gallery/disney/07.jpg",
        "alt": "迪士尼／皮克斯學員作品 1"
      },
      {
        "src": "../../assets/images/gallery/disney/20.jpg",
        "alt": "迪士尼／皮克斯學員作品 2"
      },
      {
        "src": "../../assets/images/gallery/disney/29.jpg",
        "alt": "迪士尼／皮克斯學員作品 3"
      },
      {
        "src": "../../assets/images/gallery/disney/02.jpg",
        "alt": "迪士尼／皮克斯學員作品 4"
      },
      {
        "src": "../../assets/images/gallery/disney/03.jpg",
        "alt": "迪士尼／皮克斯學員作品 5"
      },
      {
        "src": "../../assets/images/gallery/disney/04.jpg",
        "alt": "迪士尼／皮克斯學員作品 6"
      },
      {
        "src": "../../assets/images/gallery/disney/05.jpg",
        "alt": "迪士尼／皮克斯學員作品 7"
      },
      {
        "src": "../../assets/images/gallery/disney/09.jpg",
        "alt": "迪士尼／皮克斯學員作品 8"
      },
      {
        "src": "../../assets/images/gallery/disney/14.jpg",
        "alt": "迪士尼／皮克斯學員作品 9"
      },
      {
        "src": "../../assets/images/gallery/disney/28.jpg",
        "alt": "迪士尼／皮克斯學員作品 10"
      }
    ]
  },
  {
    "key": "ghibli",
    "label": "吉卜力",
    "desc": "龍貓、神隱少女等角色都有同學畫過，場景可以保留代表性的色彩與輪廓，完成自己的畫面。",
    "detail": "<a class=\"text-link\" href=\"../../guides/ghibli-reference-guide/\">吉卜力怎麼選圖？</a>",
    "images": [
      {
        "src": "../../assets/images/gallery/ghibli/05.jpg",
        "alt": "吉卜力學員作品 1"
      },
      {
        "src": "../../assets/images/gallery/ghibli/03.jpg",
        "alt": "吉卜力學員作品 2"
      },
      {
        "src": "../../assets/images/gallery/ghibli/07.jpg",
        "alt": "吉卜力學員作品 3"
      },
      {
        "src": "../../assets/images/gallery/ghibli/13.jpg",
        "alt": "吉卜力學員作品 4"
      },
      {
        "src": "../../assets/images/gallery/ghibli/10.jpg",
        "alt": "吉卜力學員作品 5"
      },
      {
        "src": "../../assets/images/gallery/ghibli/01.jpg",
        "alt": "吉卜力學員作品 6"
      },
      {
        "src": "../../assets/images/gallery/ghibli/04.jpg",
        "alt": "吉卜力學員作品 7"
      },
      {
        "src": "../../assets/images/gallery/ghibli/06.jpg",
        "alt": "吉卜力學員作品 8"
      },
      {
        "src": "../../assets/images/gallery/ghibli/09.jpg",
        "alt": "吉卜力學員作品 9"
      },
      {
        "src": "../../assets/images/gallery/ghibli/15.jpg",
        "alt": "吉卜力學員作品 10"
      }
    ]
  },
  {
    "key": "characters",
    "label": "動漫／角色",
    "desc": "迪士尼、吉卜力這類角色也有不少同學畫過。",
    "detail": "想一堂課完成，建議挑比較平面、手繪風格的角色（像白雪公主、仙履奇緣、小美人魚這類2D公主）；畫面需要疊很多層次膚色來營造立體感的（像皮克斯、夢工廠風格），通常不只一堂才畫得完，適合想多花點心思細細畫完的同學。怎麼自己先判斷難易度，可以參考材料指南的<a class=\"text-link\" href=\"../../guides/disney-pixar-reference-guide/\">「迪士尼／皮克斯怎麼選圖？」</a>。龍貓、神隱少女這類吉卜力角色也有不少同學畫過，可以參考<a class=\"text-link\" href=\"../../guides/ghibli-reference-guide/\">「吉卜力怎麼選圖？」</a>。",
    "images": []
  },
  {
    "key": "seaside",
    "label": "海邊",
    "desc": "海跟天空的組合很好掌握，通常一堂課就能完成一幅有質感的作品。",
    "detail": "",
    "images": [
      {
        "src": "../../assets/images/gallery/sea-oil/01.jpg",
        "alt": "圓形畫布的海鷗展翅飛掠海面，陽光灑落波光粼粼"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/02.jpg",
        "alt": "油畫的衝浪者剪影站在夕陽海灘上，前景點綴白色野花"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/03.jpg",
        "alt": "油畫的白衣女子漫步夕陽海灘，一群飛鳥掠過天空"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/04.jpg",
        "alt": "油畫的晴朗海景，海鷗飛掠湛藍海面與白雲"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/05.jpg",
        "alt": "黑白色調油畫，一隻狗在海灘浪花中奔跑，逆光剪影"
      },
      {
        "src": "../../assets/images/gallery/sea-oil/06.jpg",
        "alt": "圓形畫布的海浪特寫，深藍色浪頭捲起白色浪花"
      }
    ]
  },
  {
    "key": "marine",
    "label": "海洋生物",
    "desc": "鯨魚意外地也是新手很容易駕馭的題材，通常一堂課就能完成一幅有質感的作品。",
    "detail": "",
    "images": [
      {
        "src": "../../assets/images/gallery/whale/07.jpg",
        "alt": "油畫的鯨魚躍出星空般的深色背景，光束灑落，一旁有魚群剪影"
      },
      {
        "src": "../../assets/images/gallery/whale/02.jpg",
        "alt": "油畫的座頭鯨母子在海面下悠游，光線從水面灑落"
      },
      {
        "src": "../../assets/images/gallery/whale/06.jpg",
        "alt": "油畫的滿月與帆船倒影，一隻鯨魚悠游於月光海面下"
      },
      {
        "src": "../../assets/images/gallery/whale/05.jpg",
        "alt": "油畫的鯨魚悠游於星空中，光束從畫面上方灑落"
      },
      {
        "src": "../../assets/images/gallery/whale/10.jpg",
        "alt": "寫實風格的座頭鯨悠游於深藍海水中，近水面特寫"
      },
      {
        "src": "../../assets/images/gallery/whale/12.jpg",
        "alt": "油畫的大小鯨魚悠游於星空中，近景特寫"
      }
    ]
  },
  {
    "key": "botanical",
    "label": "植物花卉",
    "desc": "盆栽、花束、庭院造景都有同學畫過，顏色與筆觸的層次感是這個主題的重點，花有盛開的季節，枯枝、落葉一樣能入畫。",
    "detail": "挑選花瓣數量少、造型單純的花會比較好上手，一次抓一到三朵會比一大束容易，臨摹別人畫好的作品也會比直接照片來得簡單一些。",
    "images": [
      {
        "src": "../../assets/images/gallery/landscape-oil/01.jpg",
        "alt": "油畫的開啟窗景，窗外是飄落櫻花瓣的枯枝樹林"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/03.jpg",
        "alt": "油畫的夢幻雲彩天空，前景點綴陽台盆栽植物"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/05.jpg",
        "alt": "油畫的孤樹花海景色，藍天下一人漫步經過，一彎新月高掛"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/06.jpg",
        "alt": "油畫的棕櫚樹庭院景色，粉色大門搭配仙人掌造景"
      },
      {
        "src": "../../assets/images/gallery/landscape-oil/08.jpg",
        "alt": "油畫的窗邊靜物，陶瓶插著枯枝與落葉，雪景窗框"
      },
      {"src": "../../assets/images/gallery/landscape-oil/16.jpg", "alt": "植物花卉學員作品"},
      {"src": "../../assets/images/gallery/landscape-oil/19.jpg", "alt": "植物花卉學員作品"},
      {
        "src": "../../assets/images/gallery/star-sky/34.jpg",
        "alt": "星空油畫，櫻花樹倒映水面，上方是星球與夜空"
      }
    ]
  },
  {
    "key": "night-sky",
    "label": "星空／月亮",
    "desc": "效果簡單又好看，很適合完全沒有畫畫經驗、想先嘗試看看的同學。",
    "detail": "星星的數量、亮度都可以自己調整。",
    "images": [
      {
        "src": "../../assets/images/gallery/star-sky/07.jpg",
        "alt": "星空油畫的銀河特寫，前景是階梯與建築剪影"
      },
      {
        "src": "../../assets/images/gallery/star-sky/02.jpg",
        "alt": "星空油畫的復活節島摩艾石像剪影，頭頂是銀河與極光"
      },
      {
        "src": "../../assets/images/gallery/star-sky/10.jpg",
        "alt": "星空油畫的綠色極光灑落山脊，點綴流星雨"
      },
      {
        "src": "../../assets/images/gallery/star-sky/09.jpg",
        "alt": "星空油畫，一人站在荒原上仰望滿天繁星的剪影"
      },
      {
        "src": "../../assets/images/gallery/star-sky/21.jpg",
        "alt": "星空油畫，綠色極光籠罩帳篷營地，針葉林環繞"
      },
      {
        "src": "../../assets/images/gallery/star-sky/26.jpg",
        "alt": "星空油畫，流星雨劃過湖面，一艘小船剪影停靠岸邊"
      }
    ]
  },
  {
    "key": "animals",
    "label": "陸地動物",
    "desc": "除了家裡養的毛孩，其他喜歡的動物、甚至想像中的動物也都可以畫。",
    "detail": "可以是寫實的一根一根筆觸，也可以搭配刮刀做出比較抽象的質感，背景搭配星空也是常見的做法。",
    "images": []
  }
];
  // Only use works actually assigned to this course; do not mix in pet portrait classes.
  for (const [key, theme] of [['portrait', '人像'], ['characters', '動漫／角色'], ['animals', '陸地動物']]) {
    topics.find(t => t.key === key).images = (window.GALLERY_ITEMS || [])
      .filter(item => item.course === '自己帶圖創作' && item.themes.includes(theme))
      .map(item => ({src: '../' + item.src, alt: item.alt}));
  }
  const nav = root.querySelector('.custom-topics__nav');
  const visual = root.querySelector('.custom-topics__visual');
  const strip = root.querySelector('.custom-topics__thumbs');
  const hero = root.querySelector('.custom-topics__zoom img');
  const sources = root.querySelector('.custom-topics__lightbox-source');
  let active, current = 0, touchX = 0, touchY = 0, suppressClick = false;
  function select(index) {
    if (!active.images.length) return;
    current = (index + active.images.length) % active.images.length;
    hero.src = active.images[current].src;
    hero.alt = active.images[current].alt;
    [...strip.children].forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
    const thumb = strip.children[current];
    strip.scrollTo({left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  function render(key) {
    active = topics.find(t => t.key === key) || topics[0];
    current = 0;
    nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === active.key)));
    root.querySelector('h2').textContent = active.label;
    root.querySelector('.custom-topics__description').innerHTML = active.desc;
    root.querySelector('.custom-topics__detail').innerHTML = active.detail;
    visual.hidden = !active.images.length;
    root.querySelector('.custom-topics__empty').hidden = !!active.images.length;
    strip.replaceChildren(); sources.replaceChildren(); strip.scrollLeft = 0;
    active.images.forEach((item, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.setAttribute('aria-label', item.alt);
      const image = document.createElement('img'); image.src = item.src; image.alt = ''; image.loading = 'lazy';
      button.append(image); button.addEventListener('click', () => select(i)); strip.append(button);
      const figure = document.createElement('figure'); figure.className = 'gallery-grid__item';
      const source = document.createElement('img'); source.src = item.src; source.alt = item.alt; source.loading = 'lazy';
      figure.append(source); sources.append(figure);
    });
    select(0);
  }
  nav.addEventListener('click', e => { const button = e.target.closest('[data-topic]'); if (button) render(button.dataset.topic); });
  root.querySelector('.custom-topics__prev').addEventListener('click', () => select(current - 1));
  root.querySelector('.custom-topics__next').addEventListener('click', () => select(current + 1));
  root.querySelector('.custom-topics__zoom').addEventListener('click', () => { if (!suppressClick) sources.children[current]?.click(); });
  visual.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); select(current + (e.key === 'ArrowRight' ? 1 : -1)); } });
  hero.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, {passive: true});
  hero.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; select(current + (dx < 0 ? 1 : -1)); setTimeout(() => { suppressClick = false; }, 350); }
  }, {passive: true});
  render(location.hash.startsWith('#theme-') ? location.hash.slice(7) : 'disney');
})();
