/* ==========================================================================
   우리들의 시간 — script.js
   이 파일 위쪽의 CONFIG 영역만 수정하면 대부분의 내용을 바꿀 수 있습니다.
   ========================================================================== */

/* ------------------------------------------------------------------------
   1. 결혼식 날짜 — 카운트다운 & 캘린더에 사용됩니다.
      형식: "YYYY-MM-DDTHH:mm:ss"
   ------------------------------------------------------------------------ */
const WEDDING_DATE = new Date("2026-09-19T12:00:00");

/* ------------------------------------------------------------------------
   2. 타임라인 데이터 — "우리들의 시간"에 들어갈 순간들입니다.
      photo 경로의 이미지가 없으면 자동으로 연도가 적힌 플레이스홀더가
      표시되니, assets/img 폴더에 같은 파일명으로 사진만 넣어주세요.
   ------------------------------------------------------------------------ */
const TIMELINE = [
  {
    year: "2019",
    date: "2019. 03",
    title: "우연히, 처음",
    desc: "같은 학교 같은 강의실, 서로를 몰랐던 마지막 학기였어요.",
    photo: "assets/img/2019.jpg",
  },
  {
    year: "2020",
    date: "2020. 06",
    title: "첫 데이트",
    desc: "동네 작은 카페에서 세 시간을 이야기하고도 아쉬워했던 날.",
    photo: "assets/img/2020.jpg",
  },
  {
    year: "2022",
    date: "2022. 08",
    title: "함께한 첫 여행",
    desc: "낯선 도시에서 길을 잃어도 둘이라 걱정이 없었던 사흘.",
    photo: "assets/img/2022.jpg",
  },
  {
    year: "2024",
    date: "2024. 11",
    title: "우리, 가족이 되기로",
    desc: "노을 진 한강에서, 작은 반지와 함께 건넨 진심 어린 질문.",
    photo: "assets/img/2024-propose.jpg",
  },
  {
    year: "2026",
    date: "2026. 05",
    title: "우리 둘의 기록",
    desc: "지나온 시간을 사진 한 장에 담아본 웨딩 촬영 날.",
    photo: "assets/img/2026-wedding-shoot.jpg",
  },
];

/* ========================================================================
   내부 로직 — 아래부터는 수정하지 않아도 됩니다.
   ======================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderTimeline();
  setupRevealObserver();
  setupThreadFill();
  setupScrollCue();
  setupCountdown();
  renderCalendar();
  setupAccordion();
  setupCopyButtons();
});

/* ---------------------------- 타임라인 렌더링 ---------------------------- */
function renderTimeline() {
  const list = document.getElementById("timelineList");
  if (!list) return;

  const html = TIMELINE.map((item) => `
    <li class="timeline__item">
      <span class="timeline__knot-dot" aria-hidden="true"></span>
      <p class="timeline__year">${item.year}</p>
      <p class="timeline__date">${item.date}</p>
      <figure class="timeline__photo" data-placeholder="${item.year}년의 사진을\n추가해주세요">
        <img src="${item.photo}" alt="${item.title}" loading="lazy" />
      </figure>
      <h3 class="timeline__title">${item.title}</h3>
      <p class="timeline__desc">${item.desc}</p>
    </li>
  `).join("");

  list.innerHTML = html;

  // 이미지가 없을 때 플레이스홀더 표시
  list.querySelectorAll(".timeline__photo img").forEach((img) => {
    img.addEventListener("error", () => {
      img.closest(".timeline__photo").classList.add("no-image");
    });
  });
}

/* ---------------------------- 스크롤 리빌 ---------------------------- */
function setupRevealObserver() {
  const targets = document.querySelectorAll("[data-reveal], .timeline__item");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------- 붉은 실 채우기 ---------------------------- */
function setupThreadFill() {
  const body = document.getElementById("timelineBody");
  const fill = document.getElementById("threadFill");
  if (!body || !fill) return;

  const update = () => {
    const rect = body.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // 섹션이 화면에 들어오기 시작할 때부터 다 지나갈 때까지의 진행률(0~1)
    const total = rect.height + viewportH * 0.6;
    const progressed = viewportH * 0.75 - rect.top;
    const ratio = Math.min(1, Math.max(0, progressed / total));

    fill.style.height = `${ratio * 100}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ---------------------------- 스크롤 유도 버튼 ---------------------------- */
function setupScrollCue() {
  const cue = document.getElementById("scrollCue");
  const intro = document.querySelector(".intro");
  if (!cue || !intro) return;

  cue.addEventListener("click", () => {
    intro.scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------------------------- 카운트다운 ---------------------------- */
function setupCountdown() {
  const days = document.getElementById("cd-days");
  const hours = document.getElementById("cd-hours");
  const mins = document.getElementById("cd-min");
  const secs = document.getElementById("cd-sec");
  if (!days || !hours || !mins || !secs) return;

  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  const tick = () => {
    const diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      days.textContent = "00";
      hours.textContent = "00";
      mins.textContent = "00";
      secs.textContent = "00";
      const label = document.querySelector(".countdown__label");
      if (label) label.textContent = "저희는 오늘 결혼합니다";
      clearInterval(timer);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    days.textContent = pad(d);
    hours.textContent = pad(h);
    mins.textContent = pad(m);
    secs.textContent = pad(s);
  };

  tick();
  const timer = setInterval(tick, 1000);
}

/* ---------------------------- 미니 캘린더 ---------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth(); // 0-indexed
  const targetDate = WEDDING_DATE.getDate();

  const dow = ["일", "월", "화", "수", "목", "금", "토"];
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = dow.map((d) => `<span class="calendar__dow">${d}</span>`).join("");

  for (let i = 0; i < firstWeekday; i++) {
    html += `<span class="calendar__day"></span>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isTarget = day === targetDate;
    html += `<span class="calendar__day${isTarget ? " calendar__day--target" : ""}">${day}</span>`;
  }

  grid.innerHTML = html;
}

/* ---------------------------- 아코디언 (계좌번호) ---------------------------- */
function setupAccordion() {
  document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    const panel = trigger.nextElementSibling;
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });
}

/* ---------------------------- 계좌번호 복사 ---------------------------- */
function setupCopyButtons() {
  const toast = document.getElementById("toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        showToast("계좌번호가 복사되었습니다");
      } catch (err) {
        showToast("복사에 실패했어요. 직접 입력해 주세요");
      }
    });
  });
}
