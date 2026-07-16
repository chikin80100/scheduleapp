(() => {
"use strict";

/* ============================================================
   Constants & time model
   ============================================================ */
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
const DAY_LABEL = { mon: "月", tue: "火", wed: "水", thu: "木", fri: "金" };
const DAY_JS_INDEX = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 }; // Date#getDay()

const CLASS_LEN = 50;   // minutes
const BREAK_LEN = 10;   // minutes
const LUNCH_LEN = 40;   // minutes, after period 4
const START_MIN = 8 * 60 + 50; // 08:50 in minutes from midnight

function periodsForDay(dayKey) {
  const count = (dayKey === "tue" || dayKey === "thu") ? 7 : 6;
  const periods = [];
  let cursor = START_MIN;
  for (let p = 1; p <= count; p++) {
    const start = cursor;
    const end = start + CLASS_LEN;
    periods.push({ period: p, start, end });
    cursor = end + (p === 4 ? LUNCH_LEN : BREAK_LEN);
  }
  return periods;
}
const MAX_PERIODS = 7;
const LUNCH_AFTER_PERIOD = 4;

function minToStr(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ============================================================
   Subject presets, grouped by track (専攻)
   ============================================================ */
const COLORS = ["#F6C9B4", "#DCE7DF", "#CFE0F3", "#F4E1B5", "#E3D3EE", "#F3C6C6", "#C9E4DE", "#E8DFC8"];

const BASE_SUBJECTS = [
  { name: "数学Ⅲ", icon: "📐", color: "#CFE0F3", items: [] },
  { name: "数学C", icon: "📊", color: "#CFE0F3", items: [] },
  { name: "英語コミュニケーション", icon: "🔤", color: "#E3D3EE", items: [] },
  { name: "英語演習", icon: "📗", color: "#E3D3EE", items: [] },
  { name: "理科基礎", icon: "🧪", color: "#C9E4DE", items: [] },
  { name: "生物基礎", icon: "🔬", color: "#C9E4DE", items: [] },
  { name: "論理国語", icon: "📖", color: "#F6C9B4", items: [] },
  { name: "国語表現", icon: "✏️", color: "#F6C9B4", items: [] },
  { name: "歴史総合", icon: "🌏", color: "#F4E1B5", items: [] },
  { name: "政治・経済", icon: "🏛️", color: "#F4E1B5", items: [] },
  { name: "フードデザイン", icon: "🍳", color: "#F3C6C6", items: [] },
  { name: "体育", icon: "🏃", color: "#F3C6C6", items: [] },
  { name: "美術表現", icon: "🎨", color: "#E8DFC8", items: [] },
  { name: "プロゼミ２", icon: "🧭", color: "#DCE7DF", items: [] },
  { name: "キャリア探求", icon: "🧭", color: "#F4E1B5", items: [] },
  { name: "LHR", icon:"🧭", color: "#F4E1B5", items: [] }
];

const TRACK_PRESETS = {
  "普通科目": [],
  "機械加工専攻": [
    { name: "機械設計", icon: "⚙️", color: "#CFE0F3", items: [] },
    { name: "技術者入門", icon: "🧑‍🏭", color: "#DCE7DF", items: [] },
    { name: "原動機", icon: "🔩", color: "#F4E1B5", items: [] },
    { name: "機械工作", icon: "🛠️", color: "#F3C6C6", items: [] },
    { name: "製図", icon: "📐", color: "#E3D3EE", items: [] },
    { name: "生産技術", icon: "🏭", color: "#C9E4DE", items: [] },
    { name: "実習", icon: "🧰", color: "#E8DFC8", items: [] }
  ],
  "ロボット専攻": [
    { name: "電子機械", icon: "🤖", color: "#CFE0F3", items: [] },
    { name: "技術者入門", icon: "🧑‍🏭", color: "#DCE7DF", items: [] },
    { name: "ハードウェア技術", icon: "🔌", color: "#F4E1B5", items: [] },
    { name: "機械工作", icon: "🛠️", color: "#F3C6C6", items: [] },
    { name: "ロボット工学", icon: "🦾", color: "#E3D3EE", items: [] },
    { name: "機械設計", icon: "⚙️", color: "#C9E4DE", items: [] },
    { name: "実習", icon: "🧰", color: "#E8DFC8", items: [] }
  ],
  "電気専攻": [
    { name: "電力技術", icon: "⚡", color: "#CFE0F3", items: [] },
    { name: "電気回路", icon: "🔋", color: "#DCE7DF", items: [] },
    { name: "電気実習", icon: "🧰", color: "#F4E1B5", items: [] },
    { name: "電力技術Ｂ", icon: "⚡", color: "#F3C6C6", items: [] },
    { name: "電子技術", icon: "💡", color: "#E3D3EE", items: [] },
    { name: "電気製図", icon: "📐", color: "#C9E4DE", items: [] },
    { name: "電気機器", icon: "🔧", color: "#E8DFC8", items: [] },
    { name: "電気回路Ｂ", icon: "🔋", color: "#F6C9B4", items: [] },
    { name: "実習", icon: "🧰", color: "#DCE7DF", items: [] }
  ],
  "電子情報専攻": [
    { name: "電気回路", icon: "🔋", color: "#CFE0F3", items: [] },
    { name: "電子回路", icon: "💡", color: "#DCE7DF", items: [] },
    { name: "ハードウェア技術", icon: "🔌", color: "#F4E1B5", items: [] },
    { name: "通信応用", icon: "📡", color: "#F3C6C6", items: [] },
    { name: "通信技術", icon: "📶", color: "#E3D3EE", items: [] },
    { name: "プログラミング技術", icon: "💻", color: "#C9E4DE", items: [] },
    { name: "実習", icon: "🧰", color: "#E8DFC8", items: [] }
  ]
};

/* ============================================================
   Persistent state
   ============================================================ */
const LS_KEYS = {
  schedule: "jikanwari.schedule",
  track: "jikanwari.track",
  notify: "jikanwari.notify",
  customSubjects: "jikanwari.customSubjects",
  notified: "jikanwari.notifiedLog",
  events: "jikanwari.events"
};

const store = {
  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

let state = {
  schedule: store.load(LS_KEYS.schedule, {}),        // "mon-1" -> {name,room,items[],color}
  track: store.load(LS_KEYS.track, "普通科目"),
  notify: store.load(LS_KEYS.notify, false),
  customSubjects: store.load(LS_KEYS.customSubjects, []),
  events: store.load(LS_KEYS.events, {}),            // "YYYY-MM-DD" -> [{id,title,time,memo}]
  view: "week",
  weekOffset: 0,
  monthCursor: (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })(),
  editingKey: null, // for cell modal
  currentModalDateKey: null // for day modal event add/remove
};

function persistSchedule() { store.save(LS_KEYS.schedule, state.schedule); }
function persistEvents() { store.save(LS_KEYS.events, state.events); }
function dateKeyStr(date) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ============================================================
   DOM refs
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const trackSelect = $("#trackSelect");
const presetList = $("#presetList");
const timetableHeadRow = $("#timetableHeadRow");
const timetableBody = $("#timetableBody");
const weekLabel = $("#weekLabel");
const monthLabel = $("#monthLabel");
const monthGrid = $("#monthGrid");
const toastEl = $("#toast");
const dayModal = $("#dayModal");
const dayModalTitle = $("#dayModalTitle");
const dayModalBody = $("#dayModalBody");
const cellModal = $("#cellModal");
const cellModalTitle = $("#cellModalTitle");
const cellSubjectName = $("#cellSubjectName");
const cellRoom = $("#cellRoom");
const cellItems = $("#cellItems");
const cellColorRow = $("#cellColorRow");
const cellDeleteBtn = $("#cellDeleteBtn");
const cellModalForm = $("#cellModalForm");
const notifyBtn = $("#notifyBtn");
const notifyLabel = $("#notifyLabel");

let selectedColor = COLORS[0];

/* ============================================================
   Toast
   ============================================================ */
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
}

/* ============================================================
   Preset sidebar
   ============================================================ */
function allPresetsForTrack(track) {
  const base = track === "普通科目" ? BASE_SUBJECTS : [];
  const extra = TRACK_PRESETS[track] || [];
  const custom = state.customSubjects.filter(s => s.track === track);
  return [...base, ...extra, ...custom];
}

function renderTrackSelect() {
  trackSelect.innerHTML = "";
  Object.keys(TRACK_PRESETS).forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    if (t === state.track) opt.selected = true;
    trackSelect.appendChild(opt);
  });
}

function renderPresetList() {
  presetList.innerHTML = "";
  const subjects = allPresetsForTrack(state.track);
  subjects.forEach(subj => {
    const card = document.createElement("div");
    card.className = "preset-card";
    card.style.setProperty("--card-accent", subj.color);
    card.draggable = true;
    card.innerHTML = `
      <span class="preset-icon">${subj.icon || "📚"}</span>
      <span class="preset-name">${escapeHtml(subj.name)}</span>
      <span class="preset-items">${(subj.items || []).length}点</span>
    `;
    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer.setData("application/json", JSON.stringify(subj));
      e.dataTransfer.effectAllowed = "copy";
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    presetList.appendChild(card);
  });
}

/* ============================================================
   Week view rendering
   ============================================================ */
function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 sun .. 6 sat
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function currentWeekMonday() {
  const base = startOfWeekMonday(new Date());
  base.setDate(base.getDate() + state.weekOffset * 7);
  return base;
}

function fmtMD(date) { return `${date.getMonth() + 1}/${date.getDate()}`; }

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderWeekHeader(monday) {
  timetableHeadRow.innerHTML = `<th class="time-col-head">時限</th>`;
  const today = new Date();
  DAY_KEYS.forEach((dk, i) => {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    const th = document.createElement("th");
    if (isSameDate(d, today)) th.classList.add("is-today");
    th.innerHTML = `<span class="day-jp">${DAY_LABEL[dk]}</span><span class="day-date">${fmtMD(d)}</span>`;
    timetableHeadRow.appendChild(th);
  });
  const endDate = new Date(monday); endDate.setDate(endDate.getDate() + 4);
  weekLabel.textContent = `${monday.getFullYear()}年 ${fmtMD(monday)} 〜 ${fmtMD(endDate)}`;
}

function renderWeekBody() {
  timetableBody.innerHTML = "";
  const dayPeriods = {};
  DAY_KEYS.forEach(dk => dayPeriods[dk] = periodsForDay(dk));

  for (let p = 1; p <= MAX_PERIODS; p++) {
    const tr = document.createElement("tr");
    const timeTd = document.createElement("td");
    timeTd.className = "time-col";
    // use a day that has this period to display the time (times identical across days for shared periods)
    const refDay = DAY_KEYS.find(dk => dayPeriods[dk].some(pp => pp.period === p));
    const refPeriod = refDay ? dayPeriods[refDay].find(pp => pp.period === p) : null;
    timeTd.innerHTML = refPeriod
      ? `<span class="period-no">${p}</span><span class="period-time">${minToStr(refPeriod.start)}-${minToStr(refPeriod.end)}</span>`
      : `<span class="period-no">${p}</span>`;
    tr.appendChild(timeTd);

    DAY_KEYS.forEach(dk => {
      const periodInfo = dayPeriods[dk].find(pp => pp.period === p);
      const td = document.createElement("td");
      td.className = "cell";
      if (!periodInfo) {
        td.classList.add("empty-day");
        tr.appendChild(td);
        return;
      }
      const key = `${dk}-${p}`;
      td.dataset.key = key;
      renderCellContent(td, key);
      attachDropHandlers(td, key);
      tr.appendChild(td);
    });
    timetableBody.appendChild(tr);

    if (p === LUNCH_AFTER_PERIOD) {
      const lunchTr = document.createElement("tr");
      lunchTr.className = "lunch-row";
      const p4 = dayPeriods.mon.find(pp => pp.period === 4);
      const lunchStart = p4.end, lunchEnd = lunchStart + LUNCH_LEN;
      const lunchTd = document.createElement("td");
      lunchTd.colSpan = DAY_KEYS.length + 1;
      lunchTd.textContent = `🍱 昼休み ${minToStr(lunchStart)} - ${minToStr(lunchEnd)}`;
      lunchTr.appendChild(lunchTd);
      timetableBody.appendChild(lunchTr);
    }
  }
}

function renderCellContent(td, key) {
  const entry = state.schedule[key];
  td.innerHTML = "";
  if (entry) {
    const card = document.createElement("div");
    card.className = "class-card";
    card.style.background = entry.color || COLORS[0];
    card.innerHTML = `
      <span class="cc-name">${escapeHtml(entry.name)}</span>
      ${entry.room ? `<span class="cc-room">📍${escapeHtml(entry.room)}</span>` : ""}
      ${(entry.items && entry.items.length) ? `<span class="cc-items">${escapeHtml(entry.items.join(" / "))}</span>` : ""}
    `;
    card.addEventListener("click", () => openCellModal(key));
    td.appendChild(card);
  } else {
    const slot = document.createElement("div");
    slot.className = "cell-empty-slot";
    slot.textContent = "＋";
    slot.addEventListener("click", () => openCellModal(key));
    td.appendChild(slot);
  }
}

function attachDropHandlers(td, key) {
  td.addEventListener("dragover", (e) => { e.preventDefault(); td.classList.add("drag-over"); });
  td.addEventListener("dragleave", () => td.classList.remove("drag-over"));
  td.addEventListener("drop", (e) => {
    e.preventDefault();
    td.classList.remove("drag-over");
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const subj = JSON.parse(raw);
      state.schedule[key] = {
        name: subj.name,
        color: subj.color || COLORS[0],
        room: state.schedule[key]?.room || "",
        items: Array.isArray(subj.items) ? [...subj.items] : []
      };
      persistSchedule();
      renderCellContent(td, key);
      renderMonthGrid();
      showToast(`${subj.name} を登録しました`);
    } catch {}
  });
}

function renderWeek() {
  const monday = currentWeekMonday();
  renderWeekHeader(monday);
  renderWeekBody();
}

/* ============================================================
   Cell edit modal
   ============================================================ */
function openCellModal(key) {
  state.editingKey = key;
  const entry = state.schedule[key];
  const [dk, p] = key.split("-");
  cellModalTitle.textContent = `${DAY_LABEL[dk]}曜 ${p}時限`;
  cellSubjectName.value = entry?.name || "";
  cellRoom.value = entry?.room || "";
  cellItems.value = (entry?.items || []).join("\n");
  selectedColor = entry?.color || COLORS[0];
  renderColorRow();
  cellDeleteBtn.style.display = entry ? "inline-block" : "none";
  cellModal.showModal();
}

function renderColorRow() {
  cellColorRow.innerHTML = "";
  COLORS.forEach(c => {
    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "color-swatch" + (c === selectedColor ? " is-selected" : "");
    sw.style.background = c;
    sw.addEventListener("click", () => { selectedColor = c; renderColorRow(); });
    cellColorRow.appendChild(sw);
  });
}

cellModalForm.addEventListener("submit", (e) => {
  const submitter = e.submitter;
  if (submitter && submitter.value === "close") { state.editingKey = null; return; }
  e.preventDefault();
  const key = state.editingKey;
  if (!key) return;
  const name = cellSubjectName.value.trim();
  if (!name) { cellSubjectName.focus(); return; }
  state.schedule[key] = {
    name,
    room: cellRoom.value.trim(),
    items: cellItems.value.split("\n").map(s => s.trim()).filter(Boolean),
    color: selectedColor
  };
  persistSchedule();
  cellModal.close();
  renderWeek();
  renderMonthGrid();
  showToast("授業を保存しました");
});

cellDeleteBtn.addEventListener("click", () => {
  const key = state.editingKey;
  if (!key) return;
  delete state.schedule[key];
  persistSchedule();
  cellModal.close();
  renderWeek();
  renderMonthGrid();
  showToast("授業を削除しました");
});

/* ============================================================
   Month view
   ============================================================ */
function weekdayKeyFromDate(date) {
  const idx = date.getDay();
  for (const dk in DAY_JS_INDEX) if (DAY_JS_INDEX[dk] === idx) return dk;
  return null;
}

function scheduleForDayKey(dk) {
  const periods = periodsForDay(dk);
  return periods.map(p => ({ ...p, entry: state.schedule[`${dk}-${p.period}`] || null }));
}

function renderMonthGrid() {
  const { y, m } = state.monthCursor;
  monthLabel.textContent = `${y}年 ${m + 1}月`;
  monthGrid.innerHTML = "";

  const firstDay = new Date(y, m, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < startOffset; i++) {
    const blank = document.createElement("div");
    blank.className = "month-cell is-empty";
    monthGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const dk = weekdayKeyFromDate(date);
    const dKey = dateKeyStr(date);
    const cell = document.createElement("div");
    cell.className = "month-cell";
    if (!dk) cell.classList.add("is-weekend");
    if (isSameDate(date, today)) cell.classList.add("is-today");

    const dateEl = document.createElement("div");
    dateEl.className = "mc-date";
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    if (dk) {
      const entries = scheduleForDayKey(dk).filter(p => p.entry);
      const chips = document.createElement("div");
      chips.className = "mc-chips";
      entries.slice(0, 7).forEach(p => {
        const chip = document.createElement("span");
        chip.className = "mc-chip";
        chip.style.background = p.entry.color || COLORS[0];
        chips.appendChild(chip);
      });
      cell.appendChild(chips);
    }

    const events = state.events[dKey] || [];
    if (events.length) {
      const evRow = document.createElement("div");
      evRow.className = "mc-events";
      events.slice(0, 4).forEach(ev => {
        const dot = document.createElement("span");
        dot.className = "mc-event-dot";
        dot.title = ev.title;
        evRow.appendChild(dot);
      });
      cell.appendChild(evRow);
    }

    cell.addEventListener("click", () => openDayModal(date, dk));
    monthGrid.appendChild(cell);
  }
}

function renderEventList(dKey) {
  const listArea = $("#eventListArea");
  if (!listArea) return;
  const events = state.events[dKey] || [];
  if (!events.length) {
    listArea.innerHTML = `<p class="no-events-msg">まだ予定はありません。</p>`;
    return;
  }
  listArea.innerHTML = "";
  events
    .slice()
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
    .forEach(ev => {
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <span class="ev-time">${ev.time ? escapeHtml(ev.time) : "終日"}</span>
        <span class="ev-info">
          <span class="n">${escapeHtml(ev.title)}</span>
          ${ev.memo ? `<span class="i">${escapeHtml(ev.memo)}</span>` : ""}
        </span>
        <button type="button" class="ev-remove" aria-label="削除">✕</button>
      `;
      row.querySelector(".ev-remove").addEventListener("click", () => {
        state.events[dKey] = (state.events[dKey] || []).filter(e => e.id !== ev.id);
        if (!state.events[dKey].length) delete state.events[dKey];
        persistEvents();
        renderEventList(dKey);
        renderMonthGrid();
      });
      listArea.appendChild(row);
    });
}

function openDayModal(date, dk) {
  const dKey = dateKeyStr(date);
  state.currentModalDateKey = dKey;
  const weekdayLabel = dk ? `（${DAY_LABEL[dk]}）` : "";
  dayModalTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${weekdayLabel}`;
  dayModalBody.innerHTML = "";

  if (dk) {
    const rows = scheduleForDayKey(dk);
    const classSection = document.createElement("div");
    classSection.className = "day-section";
    classSection.innerHTML = `<h4>授業</h4>`;
    const classList = document.createElement("div");
    if (!rows.some(r => r.entry)) {
      classList.innerHTML = `<p class="no-events-msg">この曜日にはまだ授業が登録されていません。</p>`;
    } else {
      rows.forEach(r => {
        const row = document.createElement("div");
        row.className = "day-class-row";
        row.innerHTML = `
          <span class="dcr-dot" style="background:${r.entry ? (r.entry.color || COLORS[0]) : "transparent"}"></span>
          <span class="dcr-time">${minToStr(r.start)}-${minToStr(r.end)}</span>
          <span class="dcr-info">
            <span class="n">${r.entry ? escapeHtml(r.entry.name) : `${r.period}時限（未登録）`}</span>
            ${r.entry && r.entry.items && r.entry.items.length ? `<span class="i">持ち物：${escapeHtml(r.entry.items.join("、"))}</span>` : ""}
          </span>
        `;
        classList.appendChild(row);
      });
    }
    classSection.appendChild(classList);
    dayModalBody.appendChild(classSection);
  }

  const eventSection = document.createElement("div");
  eventSection.className = "day-section";
  eventSection.innerHTML = `
    <h4>予定</h4>
    <div id="eventListArea"></div>
    <div class="event-add-row">
      <input type="text" id="newEventTitle" placeholder="予定を入力（例：文化祭準備）">
      <input type="time" id="newEventTime">
      <input type="text" id="newEventMemo" placeholder="メモ（任意）">
      <button type="button" class="primary-btn" id="addEventBtn">追加</button>
    </div>
  `;
  dayModalBody.appendChild(eventSection);
  renderEventList(dKey);

  $("#addEventBtn").addEventListener("click", () => {
    const title = $("#newEventTitle").value.trim();
    if (!title) { $("#newEventTitle").focus(); return; }
    const time = $("#newEventTime").value;
    const memo = $("#newEventMemo").value.trim();
    const ev = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, time, memo };
    if (!state.events[dKey]) state.events[dKey] = [];
    state.events[dKey].push(ev);
    persistEvents();
    $("#newEventTitle").value = "";
    $("#newEventTime").value = "";
    $("#newEventMemo").value = "";
    renderEventList(dKey);
    renderMonthGrid();
    showToast("予定を追加しました");
  });

  dayModal.showModal();
}

/* ============================================================
   View switching
   ============================================================ */
function setView(view) {
  state.view = view;
  $("#weekView").classList.toggle("is-active", view === "week");
  $("#monthView").classList.toggle("is-active", view === "month");
  $("#viewWeekBtn").classList.toggle("is-active", view === "week");
  $("#viewMonthBtn").classList.toggle("is-active", view === "month");
  $("#viewWeekBtn").setAttribute("aria-selected", view === "week");
  $("#viewMonthBtn").setAttribute("aria-selected", view === "month");
}

/* ============================================================
   Notifications
   ============================================================ */
function updateNotifyUI() {
  const supported = "Notification" in window;
  notifyLabel.textContent = state.notify && supported ? "通知オン" : "通知オフ";
  notifyBtn.classList.toggle("is-on", state.notify && supported);
}

async function toggleNotify() {
  if (!("Notification" in window)) {
    showToast("このブラウザは通知に対応していません");
    return;
  }
  if (!state.notify) {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      showToast("通知が許可されませんでした");
      return;
    }
    state.notify = true;
    showToast("通知をオンにしました（アプリを開いている間、10分前にお知らせします）");
  } else {
    state.notify = false;
    showToast("通知をオフにしました");
  }
  store.save(LS_KEYS.notify, state.notify);
  updateNotifyUI();
}

function getNotifiedLog() {
  const today = new Date().toDateString();
  const log = store.load(LS_KEYS.notified, { date: today, keys: [] });
  if (log.date !== today) return { date: today, keys: [] };
  return log;
}
function markNotified(key) {
  const log = getNotifiedLog();
  log.keys.push(key);
  store.save(LS_KEYS.notified, log);
}

function checkUpcomingClasses() {
  if (!state.notify || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  const dk = weekdayKeyFromDate(now);
  if (!dk) return;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const log = getNotifiedLog();
  const periods = periodsForDay(dk);
  periods.forEach(p => {
    const entry = state.schedule[`${dk}-${p.period}`];
    if (!entry) return;
    const notifyAt = p.start - 10;
    const logKey = `${now.toDateString()}-${dk}-${p.period}`;
    if (nowMin >= notifyAt && nowMin < notifyAt + 1 && !log.keys.includes(logKey)) {
      const body = entry.items && entry.items.length
        ? `持ち物：${entry.items.join("、")}`
        : "持ち物の登録はありません";
      try {
        new Notification(`次の授業：${entry.name}（10分後）`, {
          body: entry.room ? `${body}\n教室：${entry.room}` : body,
          icon: "icons/icon-192.png",
          tag: logKey
        });
      } catch {}
      markNotified(logKey);
    }
  });
}

/* ============================================================
   Custom subject creation (lightweight)
   ============================================================ */
function addCustomSubject() {
  const name = prompt("追加する教科名を入力してください");
  if (!name || !name.trim()) return;
  const itemsRaw = prompt("持ち物をカンマ区切りで入力してください（任意）", "");
  const items = (itemsRaw || "").split(",").map(s => s.trim()).filter(Boolean);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  state.customSubjects.push({ name: name.trim(), icon: "📌", color, items, track: state.track });
  store.save(LS_KEYS.customSubjects, state.customSubjects);
  renderPresetList();
  showToast(`「${name.trim()}」を教科カードに追加しました`);
}

/* ============================================================
   Utils
   ============================================================ */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================================================
   Wire up events
   ============================================================ */
$("#viewWeekBtn").addEventListener("click", () => setView("week"));
$("#viewMonthBtn").addEventListener("click", () => setView("month"));

$("#prevWeekBtn").addEventListener("click", () => { state.weekOffset--; renderWeek(); });
$("#nextWeekBtn").addEventListener("click", () => { state.weekOffset++; renderWeek(); });
$("#todayWeekBtn").addEventListener("click", () => { state.weekOffset = 0; renderWeek(); });

$("#prevMonthBtn").addEventListener("click", () => {
  let { y, m } = state.monthCursor;
  m--; if (m < 0) { m = 11; y--; }
  state.monthCursor = { y, m };
  renderMonthGrid();
});
$("#nextMonthBtn").addEventListener("click", () => {
  let { y, m } = state.monthCursor;
  m++; if (m > 11) { m = 0; y++; }
  state.monthCursor = { y, m };
  renderMonthGrid();
});
$("#todayMonthBtn").addEventListener("click", () => {
  const d = new Date();
  state.monthCursor = { y: d.getFullYear(), m: d.getMonth() };
  renderMonthGrid();
});

trackSelect.addEventListener("change", () => {
  state.track = trackSelect.value;
  store.save(LS_KEYS.track, state.track);
  renderPresetList();
});

$("#addCustomSubjectBtn").addEventListener("click", addCustomSubject);
notifyBtn.addEventListener("click", toggleNotify);
$("#presetPackSelectBtn").addEventListener("click", () => trackSelect.focus());

document.querySelectorAll('.modal [value="close"]').forEach(btn => {
  btn.addEventListener("click", (e) => e.target.closest("dialog").close());
});

/* ============================================================
   Init
   ============================================================ */
function init() {
  renderTrackSelect();
  renderPresetList();
  renderWeek();
  renderMonthGrid();
  updateNotifyUI();
  setView("week");

  setInterval(checkUpcomingClasses, 20000);
  checkUpcomingClasses();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
})();
