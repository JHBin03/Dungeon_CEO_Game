const ROOMS_PER_FLOOR = 3;
const MONSTER_SLOTS = 2;
const TRAP_SLOTS = 1;
const STEP_MS = 650;
const HERO_ENTRY_MS = 700;
const ATTACK_TURN_MS = 600;
const HEALTH_MULTIPLIER = 2;
const WALK_FRAME_MS = 80;
const WALK_POSES = ["walk-1", "walk-2", "walk-1", "walk-2"];
const REVIVE_MS = 8000;
const ESCAPE_SEGMENTS = 3;
const ESCAPE_HIT_CHANCE = 0.5;
const MAX_RAID_SIZE = 12;
const PROMOTION_DAYS = 3;
const PROMOTION_RATE = 0.20;
const SAVE_KEY = "dungeon-ceo.save";
const SAVE_VERSION = 5;
const BANKRUPTCY_LIMIT = 3;
const NAME_LIMIT = 24;
const HERO_TOLL = 10;
const MAX_THRONE_REWARD = 10000;
const DEFAULT_THRONE_REWARD = 50;
const BREAKDOWN_RATE = 0.30;
const COLLAPSE_RATE = 0.20;
const REPAIR_COST = 25;
const FIRST_EXPANSION_STONE = 6;
const OPENING_REWARD_GOLD = 200;
const RESOURCES = { gold: "골드", stone: "석재", iron: "철", darkMatter: "암흑물질" };
const SAVE_NUMBERS = {
  floors: 1, level: 1, gold: 0, stone: 0, iron: 0, darkMatter: 0, day: 1, debt: 0, relics: 0,
  infamy: 0, popularity: 0, promotionDays: 0, lastPromotionDay: 0, throneReward: 0, debtDays: 0,
};
const HERO_CLASSES = [
  { name: "전사" },
  { name: "궁수", dodgeChance: 0.25 },
  { name: "암살자", criticalChance: 0.25, criticalMultiplier: 2 },
  { name: "마법사", teleportChance: 0.25 },
].map((hero, index) => ({ ...hero, sprite: `hero-${index + 1}` }));
const MONSTERS = [
  { name: "슬라임",       hp: 28,  attack: 9,  hire: 35,  upkeep: 2,  resource: "stone",      output: 12 },
  { name: "스켈레톤",     hp: 38,  attack: 12, hire: 70,  upkeep: 4,  resource: "iron",       output: 8 },
  { name: "좀비",         hp: 43,  attack: 11, hire: 120, upkeep: 9,  resource: "darkMatter", output: 4 },
  { name: "동굴 고블린",  hp: 54,  attack: 15, hire: 165, upkeep: 12, resource: "gold",       output: 100 },
  { name: "그림자 늑대",  hp: 68,  attack: 19, hire: 220, upkeep: 16, resource: "stone",      output: 24 },
  { name: "오크 광전사",  hp: 85,  attack: 24, hire: 285, upkeep: 21, resource: "iron",       output: 18 },
  { name: "흑철 골렘",    hp: 105, attack: 30, hire: 370, upkeep: 27, resource: "darkMatter", output: 14 },
  { name: "미노타우로스", hp: 130, attack: 37, hire: 475, upkeep: 34, resource: "stone",      output: 42 },
  { name: "심연의 리치",  hp: 158, attack: 45, hire: 605, upkeep: 43, resource: "iron",       output: 34 },
  { name: "와이번",       hp: 190, attack: 55, hire: 760, upkeep: 54, resource: "darkMatter", output: 28 },
].map((monster, index) => ({
  ...monster, hp: monster.hp * HEALTH_MULTIPLIER, level: index + 1, sprite: `monster-${index + 1}`,
}));

const TRAPS = [
  { id: "spikes", name: "가시 바닥", level: 1, cost: 70, damage: 10, effect: "입장한 용사에게 피해 10" },
  { id: "mist", name: "쇠약 안개", level: 2, cost: 110, weaken: 0.25, effect: "이 방에서 용사의 공격력 25% 감소" },
  { id: "banner", name: "광란의 깃발", level: 3, cost: 150, boost: 0.20, effect: "이 방 몬스터의 공격력 20% 증가" },
  { id: "bounty", name: "현상금 인장", level: 4, minFloors: 3, cost: 200, hitRate: 0.05, hitGold: 60, effect: "몬스터가 용사의 체력을 깎을 때 5% 확률로 골드 +60 · 침입당 용사별 1회 발동" },
  { id: "relic", name: "수집가의 제단", level: 5, minFloors: 3, cost: 240, hitRate: 0.03, hitRelics: 1, effect: "몬스터가 용사의 체력을 깎을 때 3% 확률로 고대 유물 +1 · 침입당 용사별 1회 발동" },
  { id: "crypt", name: "부활의 관", level: 6, cost: 290, reviveMs: 4000, effect: "이 방 몬스터의 부활 대기 시간 8초 → 4초" },
  { id: "gate", name: "역행의 문", level: 8, cost: 360, chance: 0.30, effect: "용사를 30% 확률로 직전 방으로 돌려보냄 · 방마다 침입당 1회 판정" },
  { id: "verdict", name: "종말의 각인", level: 10, cost: 450, threshold: 0.15, effect: "입장한 용사의 남은 체력이 15% 이하면 체력을 0으로 만듦" },
  { id: "recovery", name: "강제 회복진", level: 7, cost: 320, recoveryChance: 0.25, recoveryRatio: 0.40, sprite: "trap-6", effect: "도망 중인 용사를 25% 확률로 최대 체력의 40%까지 회복시켜 탐색 재개 · 방마다 용사당 1회 판정" },
].map((trap, index) => ({ sprite: `trap-${index + 1}`, ...trap })).sort((a, b) => a.level - b.level);

const state = {
  demonName: "마왕", dungeonName: "이름 없는 던전",
  floors: 1, level: 1, gold: 1250, stone: 0, iron: 0, darkMatter: 0,
  running: false, day: 1, debt: 0, debtDays: 0,
  openingRewardClaimed: false,
  placements: new Map(), selectedRoom: "floor-1-room-1", selectedSlot: 0,
  traps: new Map(), selectedTrapRoom: "floor-1-room-1", relics: 0,
  workshops: new Map(),
  infamy: 0, popularity: 0, escapeProgress: 0,
  promotionDays: 0, lastPromotionDay: 0, throneReward: DEFAULT_THRONE_REWARD,
};

const byId = (id) => document.getElementById(id);
const count = (value) => value.toLocaleString("ko-KR");
const roomId = (floor, room) => `floor-${floor}-room-${room}`;
const roomLabel = (id) => {
  const [, floor, , room] = id.split("-");
  return `${floor}층 ${room}번 방`;
};
const demonMaxHp = () => 240 + (state.level - 1) * 30;
const demonAttack = () => 54 + (state.level - 1) * 5;
const rewardPopularity = () => Math.floor(state.throneReward / 50);
const isBankrupt = () => state.debtDays >= BANKRUPTCY_LIMIT;
const loanLimit = () => 2 * MONSTERS[Math.min(state.level, MONSTERS.length) - 1].hire + REPAIR_COST;
const maxLoanAmount = () => Math.max(0, Math.min(loanLimit() - state.debt, Number.MAX_SAFE_INTEGER - state.gold));
const trapFloorUnlocked = (trap) => state.floors >= (trap.minFloors ?? 1);

function readNames(demonName, dungeonName) {
  const names = [demonName, dungeonName].map((name) => typeof name === "string" ? name.trim() : "");
  if (!names.every((name) => name.length && name.length <= NAME_LIMIT)) return null;
  return { demonName: names[0], dungeonName: names[1] };
}

function makeSave() {
  const progress = Object.fromEntries(Object.keys(SAVE_NUMBERS).map((key) => [key, state[key]]));
  return {
    version: SAVE_VERSION, savedAt: Date.now(), ...progress,
    openingRewardClaimed: state.openingRewardClaimed,
    demonName: state.demonName, dungeonName: state.dungeonName, escapeProgress: state.escapeProgress,
    placements: [...state.placements].map(([id, slots]) => [id, Array.from(
      { length: MONSTER_SLOTS }, (_, index) => {
        const unit = slots[index];
        return unit ? { sprite: unit.monster.sprite, hp: unit.hp, reviveAt: unit.reviveAt } : null;
      },
    )]),
    traps: [...state.traps].map(([room, trap]) => [room, trap.id]),
    workshops: [...state.workshops].map(([room, workshop]) => [room, workshop.broken]),
  };
}

function decodeSave(raw) {
  const save = JSON.parse(raw);
  if (!save || ![1, 2, 3, 4, SAVE_VERSION].includes(save.version)) throw new Error("지원하지 않는 저장 형식입니다.");
  const names = readNames(save.demonName, save.dungeonName);
  const valid = (condition) => { if (!condition) throw new Error("저장 데이터가 올바르지 않습니다."); };
  valid(names && Number.isSafeInteger(save.savedAt) && save.savedAt > 0 && save.savedAt <= 8.64e15);
  const progress = { ...names };
  for (const [key, minimum] of Object.entries(SAVE_NUMBERS)) {
    if (key === "throneReward" && save.version < 3) {
      progress[key] = DEFAULT_THRONE_REWARD;
      continue;
    }
    const addedLater = (key === "debtDays" && save.version < 4)
      || (save.version === 1 && (key === "iron" || key === "darkMatter"));
    const value = addedLater ? 0 : save[key];
    valid(Number.isSafeInteger(value) && value >= minimum);
    progress[key] = value;
  }
  valid(progress.throneReward <= MAX_THRONE_REWARD);
  progress.openingRewardClaimed = save.version < 5 ? save.floors > 1 : save.openingRewardClaimed;
  valid(typeof progress.openingRewardClaimed === "boolean");
  valid(progress.debtDays <= BANKRUPTCY_LIMIT && (progress.debt > 0 || progress.debtDays === 0));
  valid(save.floors <= save.level && save.promotionDays <= PROMOTION_DAYS && save.lastPromotionDay <= save.day);
  valid(Number.isFinite(save.escapeProgress) && save.escapeProgress >= 0 && save.escapeProgress < 1);
  progress.escapeProgress = save.escapeProgress;
  function restoreRooms(entries, restoreValue) {
    valid(Array.isArray(entries));
    const rooms = new Map();
    for (const entry of entries) {
      valid(Array.isArray(entry) && entry.length === 2 && typeof entry[0] === "string");
      const [id, value] = entry;
      const match = /^floor-([1-9]\d*)-room-([1-9]\d*)$/.exec(id);
      valid(match && +match[1] <= save.floors && +match[2] <= ROOMS_PER_FLOOR && !rooms.has(id));
      rooms.set(id, restoreValue(value));
    }
    return rooms;
  }
  progress.placements = restoreRooms(save.placements, (slots) => {
    valid(Array.isArray(slots) && slots.length === MONSTER_SLOTS && slots.some(Boolean));
    return slots.map((unit) => {
      if (unit === null) return null;
      const monster = MONSTERS.find((item) => item.sprite === unit?.sprite);
      valid(monster && monster.level <= save.level && Number.isFinite(unit.hp)
        && unit.hp >= 0 && unit.hp <= monster.hp && Number.isSafeInteger(unit.reviveAt)
        && unit.reviveAt >= 0 && unit.reviveAt <= save.savedAt + REVIVE_MS);
      if (unit.reviveAt && unit.reviveAt <= Date.now()) return { monster, hp: monster.hp, reviveAt: 0 };
      return { monster, hp: unit.hp, reviveAt: unit.reviveAt };
    });
  });
  progress.traps = restoreRooms(save.traps, (id) => {
    const trap = TRAPS.find((item) => item.id === id);
    valid(trap && trap.level <= save.level);
    return trap;
  });
  progress.workshops = restoreRooms(save.version === 1 ? [] : save.workshops, (broken) => {
    valid(typeof broken === "boolean");
    return { broken, collapsed: false };
  });
  for (const id of progress.workshops.keys()) valid(!progress.traps.has(id));
  return { progress, savedAt: save.savedAt };
}

function renderSaveControls() {
  const message = byId("save-slot");
  let canLoad = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) {
      message.textContent = "이 브라우저에 저장된 게임이 없습니다.";
    } else {
      const { progress, savedAt } = decodeSave(raw);
      canLoad = true;
      message.textContent = `${progress.dungeonName} · ${progress.day}일차 · ${new Date(savedAt).toLocaleString("ko-KR")}`;
    }
  } catch {
    message.textContent = "저장 데이터를 읽을 수 없습니다.";
  }
  byId("save-game").disabled = state.running;
  byId("load-game").disabled = state.running || !canLoad;
  byId("apply-names").disabled = state.running;
  byId("demon-name").disabled = state.running;
  byId("dungeon-name").disabled = state.running;
}

function openGameSettings() {
  byId("demon-name").value = state.demonName;
  byId("dungeon-name").value = state.dungeonName;
  byId("save-status").textContent = state.running ? "침입이 끝나면 이름 변경, 저장 및 불러오기가 가능합니다." : "";
  renderSaveControls();
  byId("game-settings").showModal();
}

function applyNames() {
  const names = readNames(byId("demon-name").value, byId("dungeon-name").value);
  if (!names) {
    byId("save-status").textContent = "두 이름을 모두 1~24자로 입력하세요.";
    return false;
  }
  Object.assign(state, names);
  byId("demon-name").value = names.demonName;
  byId("dungeon-name").value = names.dungeonName;
  renderIdentity();
  return true;
}

function saveGame() {
  if (state.running) return;
  try {
    if (localStorage.getItem(SAVE_KEY) !== null && !window.confirm("기존 저장을 덮어쓸까요?")) return;
    if (!applyNames()) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(makeSave()));
    byId("save-status").textContent = "이름을 적용하고 게임을 저장했습니다.";
    renderSaveControls();
  } catch {
    byId("save-status").textContent = "게임을 저장하지 못했습니다. 브라우저의 저장 공간 설정을 확인하세요.";
  }
}

function loadGame() {
  if (state.running) return;
  let saved;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) {
      renderSaveControls();
      byId("save-status").textContent = "저장된 게임이 없습니다.";
      return;
    }
    saved = decodeSave(raw);
  } catch {
    byId("save-status").textContent = "저장 데이터를 불러올 수 없습니다.";
    return;
  }
  if (!window.confirm("저장한 게임을 불러올까요? 저장하지 않은 진행은 사라집니다.")) return;
  const firstRoom = roomId(1, 1);
  Object.assign(state, saved.progress, { selectedRoom: firstRoom, selectedSlot: 0, selectedTrapRoom: firstRoom });
  byId("logs").replaceChildren();
  byId("raid-result").hidden = true;
  for (const unit of deployed()) {
    if (!unit.reviveAt) continue;
    const remaining = unit.reviveAt - Date.now();
    if (remaining > 0) startRevival(unit, remaining);
    else {
      unit.reviveAt = 0;
      unit.hp = unit.monster.hp;
    }
  }
  renderMap();
  byId("game-settings").close();
  renderManagement();
  byId("route-status").textContent = isBankrupt() ? "파산으로 운영이 종료되었습니다."
    : `저장한 게임을 불러왔습니다. · ${state.day}일차`;
  log("불러오기", `${state.dungeonName}의 ${state.day}일차 진행을 복원했습니다.`);
}

function renderIdentity() {
  byId("dungeon-title").textContent = state.dungeonName;
  const throne = byId("demon-health");
  throne.closest(".room").querySelector(".room-title").textContent = `${state.demonName}의 마왕방`;
  throne.setAttribute("aria-label", `${state.demonName} 체력`);
  throne.title = `${state.demonName} 체력 ${throne.value}/${throne.max}`;
}

function buildRoute(floors) {
  const route = [{ id: "start", label: "시작방" }];
  for (let floor = 1; floor <= floors; floor++) {
    for (let room = 1; room <= ROOMS_PER_FLOOR; room++) {
      route.push({ id: roomId(floor, room), label: `${floor}층 ${room}번 방` });
    }
  }
  return [...route, { id: "throne", label: `${floors}층 마왕방` }];
}

function expansionCost(floors) {
  return {
    gold: 200 * floors,
    stone: FIRST_EXPANSION_STONE * floors,
    iron: 2 * (floors - 1) ** 2,
    darkMatter: Math.ceil(Math.max(0, floors - 2) ** 3 / 2),
  };
}

function element(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}

function makeHealthBar(name, max) {
  const bar = element("progress", "health-bar");
  bar.max = max;
  bar.value = max;
  bar.setAttribute("aria-label", `${name} 체력`);
  return bar;
}

function makeRoom(id, title, kind) {
  const room = element("div", `room room-${kind}`);
  room.dataset.room = id;
  room.append(element("strong", "room-title", title));
  if (kind === "normal") {
    const slots = element("div", "room-slots");
    for (let i = 0; i < MONSTER_SLOTS; i++) {
      const slot = element("button", "slot slot-monster");
      slot.type = "button";
      slot.dataset.slot = i;
      slot.setAttribute("aria-haspopup", "dialog");
      slot.addEventListener("click", () => {
        state.selectedRoom = id;
        state.selectedSlot = i;
        renderMonsters();
        byId("monster-dialog").showModal();
      });
      const pair = element("div", "monster-pair");
      pair.append(slot, element("div", "opponent-position"));
      slots.append(pair);
    }
    const trapSlot = element("button", "slot slot-trap");
    trapSlot.type = "button";
    trapSlot.dataset.trapSlot = "";
    trapSlot.setAttribute("aria-haspopup", "dialog");
    trapSlot.addEventListener("click", () => {
      state.selectedTrapRoom = id;
      renderTraps();
      byId("trap-dialog").showModal();
    });
    slots.append(trapSlot);
    const workshopInfo = element("p", "workshop-info");
    const repair = element("button", "action workshop-repair", `장비 고치기 · ${REPAIR_COST}G`);
    repair.type = "button";
    repair.addEventListener("click", () => repairWorkshop(id));
    const convert = element("button", "action workshop-convert");
    convert.type = "button";
    convert.addEventListener("click", () => convertRoom(id));
    room.append(slots, workshopInfo, repair, convert);
  } else if (kind === "throne") {
    const portrait = element("img", "demon-lord");
    portrait.src = "assets/demon-lord.svg";
    portrait.alt = "뿔이 달린 투구와 망토를 두른 임시 마왕";
    const health = makeHealthBar("마왕", demonMaxHp());
    health.id = "demon-health";
    room.append(portrait, health);
  }
  room.append(element("div", "room-heroes"));
  return room;
}

function renderMap() {
  const map = byId("dungeon-map");
  const rows = [];
  for (let floor = state.floors; floor >= 1; floor--) {
    const row = element("section", "floor-grid");
    const title = element("h3", "floor-label", `${floor}층${floor === state.floors ? " · 꼭대기" : ""}`);
    row.append(title);
    if (floor === state.floors) {
      row.append(makeRoom("throne", "마왕방", "throne"));
    } else {
      row.append(element("p", "floor-transfer", `↗ ${floor + 1}층 오른쪽으로`));
    }
    for (let room = ROOMS_PER_FLOOR; room >= 1; room--) {
      row.append(makeRoom(roomId(floor, room), `${room}번 방`, "normal"));
    }
    rows.push(row);
  }
  const entry = element("div", "entry-grid");
  entry.append(makeRoom("start", "시작방 ↑", "start"));
  map.replaceChildren(...rows, entry);
}

const occupants = (id) => state.placements.get(id) ?? [];
const deployed = () => [...state.placements.values()].flat().filter(Boolean);
const dailyUpkeep = () => deployed().reduce((total, unit) => total + unit.monster.upkeep, 0);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const spriteUrl = (sprite, pose) => `assets/sprites/${sprite}-${pose}.png`;

function setPose(image, pose) {
  if (image.dataset.pose === pose) return;
  image.dataset.pose = pose;
  image.src = spriteUrl(image.dataset.sprite, pose);
}

function makeSprite(sprite, pose = "idle") {
  const image = element("img", "sprite");
  image.alt = "";
  image.draggable = false;
  image.dataset.sprite = sprite;
  setPose(image, pose);
  return image;
}

function showSlotSprite(button, sprite, label, pose = "idle") {
  const image = button.querySelector(".sprite");
  if (!sprite) button.textContent = label;
  else if (image?.dataset.sprite === sprite) setPose(image, pose);
  else button.replaceChildren(makeSprite(sprite, pose));
  button.title = label;
}

const trapMotion = new WeakMap();

function animateTrap(step) {
  const image = byId("dungeon-map").querySelector(`[data-room="${step.id}"] [data-trap-slot] .sprite`);
  if (!image) return;
  clearTimeout(trapMotion.get(image));
  setPose(image, "active");
  trapMotion.set(image, setTimeout(() => {
    setPose(image, "idle");
    trapMotion.delete(image);
  }, STEP_MS));
}

function refreshSlots() {
  for (const button of byId("dungeon-map").querySelectorAll("[data-slot]")) {
    const id = button.closest("[data-room]").dataset.room;
    const index = Number(button.dataset.slot);
    const unit = occupants(id)[index];
    const status = unit
      ? `${unit.monster.name}${unit.reviveAt ? " · 부활 중" : unit.opponent ? ` · ${unit.opponent.name} 상대 중` : ""}`
      : `빈 슬롯 ${index + 1}`;
    showSlotSprite(button, unit?.monster.sprite, status, unit?.attacking ? "attack" : "idle");
    if (unit) {
      let health = button.querySelector(".health-bar");
      if (!health) {
        health = makeHealthBar(unit.monster.name, unit.monster.hp);
        button.append(health);
      }
      health.value = unit.hp;
      button.title = `${status} · 체력 ${unit.hp}/${unit.monster.hp}`;
    }
    button.dataset.downed = String(Boolean(unit?.reviveAt));
    const [, floor, , room] = id.split("-");
    button.setAttribute("aria-label", `${floor}층 ${room}번 방, 슬롯 ${index + 1}: ${button.title}`);
  }
}

function resourceList(amounts) {
  return Object.entries(amounts).map(([resource, amount]) =>
    `${RESOURCES[resource]} ${count(amount)}`).join(" · ");
}

function workshopWorkers(id) {
  return occupants(id).filter((unit) => unit && !unit.reviveAt);
}

function workshopOutput(workers, broken = false) {
  const output = {};
  for (const { monster } of workers) {
    const amount = broken ? Math.floor(monster.output / 2) : monster.output;
    output[monster.resource] = (output[monster.resource] ?? 0) + amount;
  }
  return output;
}

function renderWorkshops() {
  for (const room of byId("dungeon-map").querySelectorAll(".room-normal")) {
    const id = room.dataset.room;
    const workshop = state.workshops.get(id);
    const info = room.querySelector(".workshop-info");
    const repair = room.querySelector(".workshop-repair");
    const convert = room.querySelector(".workshop-convert");
    room.classList.toggle("room-workshop", Boolean(workshop));
    room.querySelector(".room-title").textContent = `${id.split("-").at(-1)}번 방${workshop ? " · 작업장" : ""}`;
    room.querySelector("[data-trap-slot]").hidden = Boolean(workshop);
    info.hidden = !workshop;
    repair.hidden = !workshop?.broken || workshop.collapsed;
    repair.disabled = state.gold < REPAIR_COST;
    convert.textContent = workshop ? "방어실로 전환" : "작업장으로 전환";
    const occupied = occupants(id).some(Boolean) || state.traps.has(id);
    convert.disabled = state.running || occupied;
    convert.title = occupied ? "배치된 몬스터와 함정을 먼저 해제하세요." : "";
    if (!workshop) continue;

    const workers = occupants(id).filter(Boolean);
    const active = workshopWorkers(id);
    const names = workers.map((unit) => `${unit.monster.name}${unit.reviveAt ? " (부활 중)" : ""}`).join(", ");
    const output = resourceList(workshopOutput(active, workshop.broken));
    info.textContent = `${names || "배치된 몬스터 없음"} · ${workshop.collapsed ? "갱도 붕괴 · 오늘 생산 중단"
      : `하루 ${output || "생산 없음"}${workshop.broken ? " · 장비 고장" : ""}`}`;
  }
}

function convertRoom(id) {
  if (state.running || occupants(id).some(Boolean) || state.traps.has(id)) return;
  const workshop = state.workshops.get(id);
  if (workshop) {
    state.workshops.delete(id);
  } else {
    state.workshops.set(id, { broken: false, collapsed: false });
  }
  log("방 전환", `${roomLabel(id)} · ${workshop ? "방어실" : "작업장"}로 전환`);
  renderManagement();
}

function repairWorkshop(id) {
  const workshop = state.workshops.get(id);
  if (!workshop?.broken || workshop.collapsed || state.gold < REPAIR_COST) return;
  state.gold -= REPAIR_COST;
  workshop.broken = false;
  log("장비 수리", `${roomLabel(id)} · ${REPAIR_COST}골드 지불 · 정상 생산 재개`);
  renderManagement();
}

function rollWorkshopAccidents() {
  for (const [id, workshop] of state.workshops) {
    const workers = workshopWorkers(id);
    if (!workers.length) continue;
    const roll = Math.random();
    const collapseRate = workers.some(({ monster }) => monster.resource !== "gold") ? COLLAPSE_RATE : 0;
    if (roll < collapseRate) {
      const lost = resourceList(workshopOutput(workers, workshop.broken));
      const dead = occupants(id).filter(Boolean).map(({ monster }) => monster.name).join(", ");
      state.placements.delete(id);
      workshop.collapsed = true;
      workshop.broken = false;
      log("갱도 붕괴", `${roomLabel(id)} · 당일 생산 손실 ${lost} · 사망 ${dead} (부활 불가)`);
    } else if (!workshop.broken && roll < collapseRate + BREAKDOWN_RATE) {
      workshop.broken = true;
      log("장비 고장", `${roomLabel(id)} · 수리 전까지 생산량 50% 감소`);
    }
  }
}

function collectWorkshopProduction() {
  for (const [id, workshop] of state.workshops) {
    if (workshop.collapsed) {
      workshop.collapsed = false;
      continue;
    }
    const workers = workshopWorkers(id);
    if (!workers.length) continue;
    const output = workshopOutput(workers, workshop.broken);
    for (const [resource, amount] of Object.entries(output)) state[resource] += amount;
    const loss = workshop.broken ? resourceList(output) : "";
    log("작업장 생산", `${roomLabel(id)} · 획득 ${resourceList(output)}${loss ? ` · 고장으로 손실 ${loss}` : ""}`);
  }
}

function renderMonsters() {
  refreshSlots();
  const [, floor, , room] = state.selectedRoom.split("-");
  const unit = occupants(state.selectedRoom)[state.selectedSlot];
  const workshop = state.workshops.has(state.selectedRoom);
  byId("placement-title").textContent = `${floor}층 ${room}번 방 · ${workshop ? "작업장" : "방어실"} 슬롯 ${state.selectedSlot + 1}`;
  byId("monster-summary").textContent = `배치 ${deployed().length} / ${state.floors * ROOMS_PER_FLOOR * MONSTER_SLOTS} · 하루 유지비 ${count(dailyUpkeep())}골드`;
  byId("placement-status").textContent = state.running ? "침입이 끝나면 배치를 변경할 수 있습니다."
    : unit ? `${unit.monster.name} 배치됨${unit.reviveAt ? " · 부활 대기 중" : ""}`
    : "빈 슬롯입니다. 아래에서 몬스터를 고용하세요.";
  byId("dismiss-monster").disabled = state.running || !unit;
  byId("dismiss-monster").hidden = !unit;
  const moveForm = byId("monster-move-form");
  moveForm.hidden = !unit || state.running;
  if (!moveForm.hidden) {
    const destination = byId("monster-move-target");
    const previous = destination.value;
    destination.replaceChildren(element("option", "", "이동할 빈 슬롯 선택"));
    destination.options[0].value = "";
    for (const step of buildRoute(state.floors).slice(1, -1)) {
      for (let slot = 0; slot < MONSTER_SLOTS; slot++) {
        if (occupants(step.id)[slot]) continue;
        const type = state.workshops.has(step.id) ? "작업장" : "방어실";
        const option = element("option", "", `${step.label} · ${type} 슬롯 ${slot + 1}`);
        option.value = `${step.id}:${slot}`;
        destination.append(option);
      }
    }
    if ([...destination.options].some((option) => option.value === previous)) destination.value = previous;
    destination.disabled = destination.options.length === 1;
    byId("move-monster").disabled = destination.disabled;
    if (destination.disabled) destination.options[0].textContent = "이동할 빈 슬롯이 없습니다.";
  }
  for (const [index, monster] of MONSTERS.entries()) {
    const card = byId("monster-catalog").children[index];
    card.hidden = Boolean(unit && unit.monster !== monster);
    const locked = state.level < monster.level;
    const button = card.querySelector("button");
    button.disabled = locked || Boolean(unit) || state.running || state.gold < monster.hire;
    button.textContent = locked ? `Lv. ${monster.level} 해금`
      : state.gold < monster.hire ? "골드 부족" : "고용";
  }
}

function moveMonster(event) {
  event.preventDefault();
  const source = state.selectedRoom;
  const slots = occupants(source);
  const unit = slots[state.selectedSlot];
  if (state.running || isBankrupt() || !unit) return;
  const [target, slot] = byId("monster-move-target").value.split(":");
  const index = Number(slot);
  if (!Number.isInteger(index) || index < 0 || index >= MONSTER_SLOTS
      || !buildRoute(state.floors).slice(1, -1).some((step) => step.id === target)) return;
  const targetSlots = occupants(target);
  if (targetSlots[index]) return;
  slots[state.selectedSlot] = null;
  targetSlots[index] = unit;
  state.placements.set(target, targetSlots);
  if (!slots.some(Boolean)) state.placements.delete(source);
  state.selectedRoom = target;
  state.selectedSlot = index;
  log("몬스터 이동", `${unit.monster.name} · ${roomLabel(source)} → ${roomLabel(target)} 슬롯 ${index + 1}`);
  renderManagement();
}

function hireMonster(monster) {
  const slots = occupants(state.selectedRoom);
  if (state.running || state.level < monster.level || state.gold < monster.hire || slots[state.selectedSlot]) return;
  state.gold -= monster.hire;
  slots[state.selectedSlot] = { monster, hp: monster.hp, reviveAt: 0 };
  state.placements.set(state.selectedRoom, slots);
  log("몬스터 고용", `${monster.name} 배치 · ${monster.hire}골드 지불`);
  renderManagement();
}

function dismissMonster() {
  const slots = occupants(state.selectedRoom);
  const unit = slots[state.selectedSlot];
  if (state.running || !unit) return;
  slots[state.selectedSlot] = null;
  if (!slots.some(Boolean)) state.placements.delete(state.selectedRoom);
  log("몬스터 해고", `${unit.monster.name}의 배치를 해제했습니다.`);
  renderManagement();
}

function buildMonsterCatalog() {
  for (const monster of MONSTERS) {
    const card = element("li", "monster-card");
    const hire = element("button", "action");
    hire.type = "button";
    hire.addEventListener("click", () => hireMonster(monster));
    card.append(makeSprite(monster.sprite), element("strong", "", monster.name),
      element("span", "monster-meta", `체력 ${monster.hp} · 공격 ${monster.attack}`),
      element("span", "monster-meta", `고용 ${monster.hire}G · 유지 ${monster.upkeep}G/일`),
      element("span", "monster-meta", `작업장 생산 · ${RESOURCES[monster.resource]} ${monster.output}/일`), hire);
    byId("monster-catalog").append(card);
  }
}

function buildTrapCatalog() {
  for (const trap of TRAPS) {
    const card = element("li", "monster-card");
    const install = element("button", "action");
    install.type = "button";
    install.addEventListener("click", () => installTrap(trap));
    card.append(makeSprite(trap.sprite), element("strong", "", trap.name),
      element("span", "monster-meta", trap.effect),
      element("span", "monster-meta", `설치 ${trap.cost}G · 마왕 Lv. ${trap.level} 해금`), install);
    byId("trap-catalog").append(card);
  }
}

function renderTraps() {
  const room = state.selectedTrapRoom;
  const installed = state.traps.get(room);
  for (const button of byId("dungeon-map").querySelectorAll("[data-trap-slot]")) {
    const id = button.closest("[data-room]").dataset.room;
    const [, floor, , number] = id.split("-");
    const trap = state.traps.get(id);
    const label = trap?.name ?? "빈 함정";
    const image = button.querySelector(".sprite");
    showSlotSprite(button, trap?.sprite, label, trapMotion.has(image) ? "active" : "idle");
    button.setAttribute("aria-label", `${floor}층 ${number}번 방 함정: ${label}`);
  }
  const [, floor, , number] = room.split("-");
  byId("trap-placement-title").textContent = `${floor}층 ${number}번 방 · 함정 슬롯`;
  byId("trap-summary").textContent = `설치 ${state.traps.size} / ${state.floors * ROOMS_PER_FLOOR * TRAP_SLOTS} · 철거 시 비용은 반환되지 않습니다.`;
  byId("trap-placement-status").textContent = state.running ? "침입이 끝나면 함정을 변경할 수 있습니다."
    : installed && !trapFloorUnlocked(installed) ? "던전을 3층까지 증축하면 설치된 함정이 작동합니다."
    : installed ? `${installed.name} 설치됨` : "빈 슬롯입니다. 아래에서 함정을 설치하세요.";
  byId("remove-trap").disabled = state.running || !installed;
  byId("remove-trap").hidden = !installed;
  for (const [index, trap] of TRAPS.entries()) {
    const card = byId("trap-catalog").children[index];
    card.hidden = Boolean(installed && installed !== trap);
    const button = card.querySelector("button");
    const locked = state.level < trap.level;
    const floorLocked = !trapFloorUnlocked(trap);
    button.disabled = locked || floorLocked || Boolean(installed) || state.running || state.gold < trap.cost;
    button.textContent = floorLocked ? "던전 3층 필요" : locked ? `Lv. ${trap.level} 해금` : state.gold < trap.cost ? "골드 부족" : "설치";
  }
}

function installTrap(trap) {
  const room = state.selectedTrapRoom;
  if (state.running || state.workshops.has(room) || state.traps.has(room)
      || !trapFloorUnlocked(trap) || state.level < trap.level || state.gold < trap.cost) return;
  state.gold -= trap.cost;
  state.traps.set(room, trap);
  log("함정 설치", `${trap.name} 설치 · ${trap.cost}골드 지불`);
  renderManagement();
}

function removeTrap() {
  const room = state.selectedTrapRoom;
  const trap = state.traps.get(room);
  if (state.running || !trap) return;
  state.traps.delete(room);
  log("함정 철거", `${trap.name}을(를) 철거했습니다.`);
  renderManagement();
}

function renderPanel(target, title, description, entries) {
  const panel = byId("panel-template").content.cloneNode(true);
  panel.querySelector("h3").textContent = title;
  panel.querySelector("p").textContent = description;
  for (const [label, value] of entries) {
    const stat = byId("stat-template").content.cloneNode(true);
    stat.querySelector("dt").textContent = label;
    stat.querySelector("dd").textContent = value;
    panel.querySelector("dl").append(stat);
  }
  byId(target).replaceChildren(panel);
}

function log(category, message, kind = "management") {
  const time = new Date().toTimeString().slice(0, 5);
  const row = byId("log-template").content.cloneNode(true);
  row.querySelector("li").dataset.kind = kind;
  row.querySelector("time").dateTime = time;
  row.querySelector("time").textContent = time;
  row.querySelector(".log-category").textContent = category;
  row.querySelector(".log-message").textContent = message;
  byId("logs").prepend(row);
}

function expansionBlocker(cost) {
  const blockers = [];
  if (state.running) blockers.push("침입 종료 후 증축 가능");
  if (state.level <= state.floors) blockers.push(`마왕 Lv. ${state.floors + 1} 필요`);
  const missing = Object.entries(cost).filter(([resource, amount]) => state[resource] < amount)
    .map(([resource, amount]) => [resource, amount - state[resource]]);
  if (missing.length) blockers.push(`부족 · ${resourceList(Object.fromEntries(missing))}`);
  return blockers.join(" / ");
}

function raidProfile() {
  const size = Math.min(MAX_RAID_SIZE, HERO_CLASSES.length + Math.floor((state.popularity + rewardPopularity()) / 2));
  const rewardTier = Math.floor(state.throneReward / 250);
  const infamyHonor = Math.min(Math.ceil(state.infamy / 4), Math.floor(size / 4));
  const honorCount = Math.min(infamyHonor + rewardTier, Math.floor(size / 2));
  const honorPower = 140 + 10 * Math.floor(Math.max(0, state.infamy - 1) / 4) + 5 * rewardTier;
  return { size, honorCount, honorPower };
}

function promotionGain(popularity) {
  return Math.max(1, Math.ceil(popularity * PROMOTION_RATE));
}

function promotionCost() {
  return 80 + 12 * state.popularity;
}

function promotionBlocker() {
  if (state.running) return "침입이 끝나면 홍보할 수 있습니다.";
  if (state.lastPromotionDay === state.day) return "오늘은 이미 홍보했습니다.";
  if (state.gold < promotionCost()) return "홍보에 필요한 골드가 부족합니다.";
  return "";
}

function renderActivities() {
  const blocker = promotionBlocker();
  byId("promotion-buy").disabled = Boolean(blocker);
  byId("promotion-buy").textContent = `홍보하기 · ${count(promotionCost())}골드`;
  byId("promotion-status").textContent = [
    state.promotionDays
      ? `홍보 진행 중 · 남은 효과 ${state.promotionDays}일 · 다음 정산에서 인기도 최소 +${promotionGain(state.popularity)}`
      : "진행 중인 홍보가 없습니다.",
    blocker,
  ].filter(Boolean).join(" · ");
}

function promoteDungeon() {
  if (promotionBlocker()) return;
  const cost = promotionCost();
  state.gold -= cost;
  state.lastPromotionDay = state.day;
  state.promotionDays = PROMOTION_DAYS;
  log("던전 홍보", `${count(cost)}골드 지불 · 앞으로 3일간 일일 정산에 인기도 증가`);
  renderManagement();
}

function recordEscapes(escaped, total) {
  const previous = state.popularity;
  const progress = state.escapeProgress + escaped / total;
  const gain = Math.floor(progress + 1e-9);
  state.escapeProgress = Math.max(0, progress - gain);
  state.popularity += gain;
  if (escaped) {
    log("던전 인기도", `도주 성공 ${escaped}/${total}명 · 인기도 +${state.popularity - previous} · 다음 +1까지 ${escapePercent()}%`);
  }
}

function escapePercent() {
  return Math.min(99, Math.floor(state.escapeProgress * 100 + 1e-7));
}

function renderDungeonStats() {
  const { size, honorCount } = raidProfile();
  const bonus = rewardPopularity();
  renderPanel("dungeon-stats", "던전 현황", "마왕방은 던전의 가장 높은 층에 있습니다.", [
    ["현재 날짜", `${state.day}일차`],
    ["마왕 레벨", `Lv. ${state.level}`],
    ["마왕 능력치", `체력 ${count(demonMaxHp())} · 공격력 ${count(demonAttack())}`],
    ["던전 악명", count(state.infamy)],
    ["던전 인기도", `${count(state.popularity + bonus)} (보상 +${count(bonus)} · 도주 누적 ${escapePercent()}%)`],
    ["예상 침입 규모", `${size}명 (명예 용사 ${honorCount}명)`],
    ["보유 석재", `${count(state.stone)}개`],
    ["보유 철", `${count(state.iron)}개`],
    ["보유 암흑물질", `${count(state.darkMatter)}개`],
    ["보유 고대 유물", `${count(state.relics)}개`],
    ["미납금", `${count(state.debt)}골드`],
  ]);
}

function renderManagement() {
  const rooms = state.floors * ROOMS_PER_FLOOR;
  byId("gold").textContent = count(state.gold);
  byId("floor-count").textContent = `총 ${state.floors}층 · 일반방 ${rooms}개`;
  const health = byId("demon-health");
  health.max = demonMaxHp();
  health.value = health.max;
  renderIdentity();
  if (byId("game-settings").open) {
    renderSaveControls();
    if (!state.running) byId("save-status").textContent = "";
  }
  renderDungeonStats();
  renderActivities();
  renderMonsters();
  renderTraps();
  renderWorkshops();
  const cost = expansionCost(state.floors);
  const blocker = expansionBlocker(cost);
  byId("expansion-cost").textContent = `${state.floors + 1}층 · Lv. ${state.floors + 1} · ${resourceList(cost)}`;
  byId("expand-floor").disabled = Boolean(blocker);
  byId("expansion-status").textContent = blocker || "증축할 수 있습니다.";
  byId("opening-goal").hidden = state.openingRewardClaimed;
  byId("start-route").disabled = state.running || isBankrupt();
  const reward = byId("throne-reward");
  reward.value = state.throneReward;
  reward.max = MAX_THRONE_REWARD;
  reward.disabled = state.running;
  byId("apply-throne-reward").disabled = state.running;
  const { size } = raidProfile();
  byId("throne-reward-status").textContent = `현재 1인당 ${count(state.throneReward)}골드 · 최대 지급액 ${count(state.throneReward * size)}골드`;
  byId("raid-preview").hidden = state.running || isBankrupt();
  byId("raid-preview").textContent = `다음 침입 예상 · 용사 ${size}명 · 통행료 +${count(size * HERO_TOLL)}골드 · 유지비 ${count(dailyUpkeep())}골드 · 마왕 처치 보상 최대 ${count(state.throneReward * size)}골드`;
  renderDebt();
}

function renderDebt() {
  const bankrupt = isBankrupt();
  const dungeon = byId("dungeon-section");
  dungeon.dataset.debtDays = state.debtDays;
  dungeon.querySelector(".map-scroll").inert = bankrupt;
  byId("management-section").inert = bankrupt;
  byId("game-over").hidden = !bankrupt;
  const warning = byId("bankruptcy-warning");
  warning.hidden = state.debtDays === 0 || bankrupt;
  warning.textContent = `파산 경고 ${state.debtDays}/${BANKRUPTCY_LIMIT}${state.debtDays === BANKRUPTCY_LIMIT - 1 ? " · 다음 정산까지 완납 필요" : ""}`;

  const maxPayment = Math.min(state.gold, state.debt);
  const amount = byId("debt-payment");
  amount.max = maxPayment;
  amount.disabled = state.running || bankrupt || maxPayment < 1;
  byId("pay-debt").disabled = amount.disabled;
  byId("debt-payment-form").hidden = state.debt === 0;
  byId("debt-payment-status").textContent = state.debt > 0
    ? `미납 ${count(state.debt)}골드 · 납부 가능 ${count(maxPayment)}골드`
    : "미납금이 없습니다.";

  const loan = byId("bank-loan");
  const maxLoan = maxLoanAmount();
  loan.max = maxLoan;
  loan.disabled = state.running || bankrupt || maxLoan < 1;
  renderLoanPreview();
}

function renderLoanPreview() {
  const input = byId("bank-loan");
  const amount = input.valueAsNumber;
  const valid = Number.isSafeInteger(amount) && amount >= 1 && amount <= maxLoanAmount();
  byId("take-loan").disabled = input.disabled || !valid;
  const remaining = BANKRUPTCY_LIMIT - state.debtDays;
  byId("bank-loan-guide").textContent = [
    `미납금 포함 한도 ${count(loanLimit())}골드 · 추가 대출 가능 ${count(maxLoanAmount())}골드`,
    valid ? `상환액 ${count(amount)}골드 (이자 없음) · 기존 미납금 포함 총 ${count(state.debt + amount)}골드` : "",
    `미납 지속 시 파산까지 ${remaining}회 정산`,
  ].filter(Boolean).join(" · ");
}

function takeLoan(event) {
  event.preventDefault();
  if (state.running || isBankrupt()) return;
  const input = byId("bank-loan");
  const amount = input.valueAsNumber;
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > maxLoanAmount()) return;
  state.gold += amount;
  state.debt += amount;
  input.value = "";
  log("은행 대출", `${count(amount)}골드 대출 · 현재 미납금 ${count(state.debt)}골드`);
  renderManagement();
}

function payDebt(event) {
  event.preventDefault();
  if (state.running || isBankrupt()) return;
  const input = byId("debt-payment");
  const amount = input.valueAsNumber;
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > Math.min(state.gold, state.debt)) return;
  state.gold -= amount;
  state.debt -= amount;
  if (state.debt === 0) state.debtDays = 0;
  input.value = "";
  log("미납금 납부", `${count(amount)}골드 납부 · 남은 미납금 ${count(state.debt)}골드`);
  renderManagement();
}

function visitRoom(step, hero) {
  const map = byId("dungeon-map");
  const room = map.querySelector(`[data-room="${step.id}"]`);
  updateHeroMarker(hero);
  room.querySelector(".room-heroes").append(hero.marker);
  if (hero.room && hero.room !== step.id) walkHero(hero);
  hero.room = step.id;
  if (hero !== hero.raid.active.values().next().value) return;
  const viewport = map.parentElement;
  const bounds = viewport.getBoundingClientRect();
  const tile = room.getBoundingClientRect();
  if (tile.left < bounds.left || tile.right > bounds.left + viewport.clientWidth) {
    viewport.scrollLeft += tile.left - bounds.left - (viewport.clientWidth - tile.width) / 2;
  }
}

function updateHeroMarker(hero, opponent = "") {
  const label = hero.retreating ? `${hero.name} 도망 ${hero.escape}/${ESCAPE_SEGMENTS}`
    : `${hero.name} 체력 ${hero.hp}/${hero.maxHp}`;
  hero.marker.title = opponent ? `${label} · ${opponent}` : label;
  hero.marker.toggleAttribute("data-retreating", Boolean(hero.retreating));
  hero.marker.setAttribute("aria-label", hero.marker.title);
  hero.health.value = hero.hp;
  hero.health.hidden = hero.retreating;
  hero.escapeBar.hidden = !hero.retreating;
  hero.escapeBar.setAttribute("aria-valuenow", hero.escape);
  for (const [index, segment] of [...hero.escapeBar.children].entries()) {
    segment.toggleAttribute("data-filled", index < hero.escape);
  }
}

function setHeroPose(hero, pose) {
  clearTimeout(hero.walkTimer);
  setPose(hero.image, pose);
}

function walkHero(hero) {
  clearTimeout(hero.walkTimer);
  let frame = 0;
  function advanceFrame() {
    setPose(hero.image, WALK_POSES[frame] ?? "idle");
    if (frame < WALK_POSES.length) {
      frame++;
      hero.walkTimer = setTimeout(advanceFrame, WALK_FRAME_MS);
    }
  }
  advanceFrame();
}

function startRevival(unit, delay) {
  unit.reviveAt = Date.now() + delay;
  setTimeout(() => {
    if (isBankrupt() || !deployed().includes(unit)) return;
    unit.reviveAt = 0;
    unit.hp = unit.monster.hp;
    log("몬스터 부활", `${unit.monster.name}이(가) 다시 활동합니다.`);
    renderMonsters();
    renderWorkshops();
  }, delay);
}

function triggerEntryTrap(step, hero, trap) {
  if (trap?.damage) {
    animateTrap(step);
    hero.hp = Math.max(0, hero.hp - trap.damage);
    log("함정 발동", `${step.label} · ${trap.name} · ${hero.name} 피해 ${trap.damage}`, "intrusion");
  }
  if (trap?.threshold && hero.hp > 0 && hero.hp / hero.maxHp <= trap.threshold) {
    animateTrap(step);
    hero.hp = 0;
    log("함정 발동", `${step.label} · ${trap.name} · ${hero.name} 체력 0`, "intrusion");
  }
}

function startRetreat(step, hero) {
  hero.raid.rooms.get(step.id)?.repelled.add(hero);
  hero.retreating = true;
  hero.escape = ESCAPE_SEGMENTS;
  updateHeroMarker(hero);
  log("용사 도망", `${step.label} · ${hero.name} 체력 0 · 시작방으로 도망`, "intrusion");
}

function checkTollDecision(hero) {
  if (hero.checkedToll || hero.hp * 5 > hero.maxHp) return;
  hero.checkedToll = true;
  hero.paidToll = Math.random() < 0.20;
  if (!hero.paidToll) log("전투 지속", `${hero.name} · 전투 계속 선택`, "intrusion");
}

function triggerHitTrap(step, hero, trap) {
  if (!trap?.hitRate) return;
  const triggered = hero.raid.rooms.get(step.id).hitTrapTriggered;
  if (triggered.has(hero) || Math.random() >= trap.hitRate) return;
  triggered.add(hero);
  const gold = trap.hitGold ?? 0;
  const relics = trap.hitRelics ?? 0;
  state.gold += gold;
  state.relics += relics;
  hero.raid.bountyGold += gold;
  hero.raid.relics += relics;
  if (gold) {
    byId("gold").textContent = count(state.gold);
    renderWorkshops();
  }
  if (relics) renderDungeonStats();
  animateTrap(step);
  log("함정 발동", `${step.label} · ${trap.name} · ${hero.name} 피격 · ${gold ? `골드 +${gold}` : `고대 유물 +${relics}`}`, "intrusion");
}

async function fightRoom(step, hero, unit, slot, trap) {
  const position = hero.marker.closest(".room").querySelector(`[data-slot="${slot}"] + .opponent-position`);
  position.append(hero.marker);
  unit.opponent = hero;
  refreshSlots();
  const { monster } = unit;
  const heroAttack = Math.max(1, Math.floor(hero.attack * (1 - (trap?.weaken ?? 0))));
  const boost = trap?.boost ?? 0;
  const attack = Math.round(monster.attack * (1 + boost));
  if (hero.image.dataset.pose.startsWith("walk-")) await wait(WALK_FRAME_MS * WALK_POSES.length);
  if (trap?.weaken || boost) {
    animateTrap(step);
    log("함정 발동", `${step.label} · ${trap.name} · ${trap.effect}`, "intrusion");
  }
  try {
    do {
      unit.attacking = true;
      refreshSlots();
      setHeroPose(hero, "idle");
      if (hero.dodgeChance && Math.random() < hero.dodgeChance) {
        log("공격 회피", `${step.label} · 궁수가 ${monster.name}의 공격을 피했습니다.`, "intrusion");
      } else {
        const hp = Math.max(0, hero.hp - attack);
        if (hp < hero.hp) {
          hero.hp = hp;
          triggerHitTrap(step, hero, trap);
        }
      }
      checkTollDecision(hero);
      if (hero.paidToll) return;
      if (hero.hp === 0) startRetreat(step, hero);
      updateHeroMarker(hero, `${monster.name} ${unit.hp}/${monster.hp}`);
      await wait(ATTACK_TURN_MS);
      unit.attacking = false;
      refreshSlots();
      if (hero.hp > 0) {
        setHeroPose(hero, "attack");
        const critical = hero.criticalChance && Math.random() < hero.criticalChance;
        const damage = critical ? heroAttack * hero.criticalMultiplier : heroAttack;
        unit.hp = Math.max(0, unit.hp - damage);
        refreshSlots();
        if (critical) log("치명타", `${step.label} · 암살자가 ${monster.name}에게 피해 ${damage}`, "intrusion");
      }
      updateHeroMarker(hero, `${monster.name} ${unit.hp}/${monster.hp}`);
      await wait(ATTACK_TURN_MS);
    } while (hero.hp > 0 && unit.hp > 0);
    if (unit.hp === 0) {
      if (trap?.reviveMs) animateTrap(step);
      const delay = trap?.reviveMs ?? REVIVE_MS;
      startRevival(unit, delay);
      log("몬스터 처치", `${step.label} · ${hero.name}가 ${monster.name} 처치 · ${delay / 1000}초 후 부활`, "intrusion");
    }
  } finally {
    unit.attacking = false;
    unit.opponent = null;
    refreshSlots();
    setHeroPose(hero, "idle");
    updateHeroMarker(hero);
    position.closest(".room").querySelector(".room-heroes").append(hero.marker);
  }
}

function advanceDay() {
  collectWorkshopProduction();
  state.day++;
  if (state.promotionDays > 0) {
    const gain = promotionGain(state.popularity);
    state.popularity += gain;
    state.promotionDays--;
    log("홍보 효과", `${state.day}일차 · 인기도 +${gain} · ${state.promotionDays ? `남은 효과 ${state.promotionDays}일` : "홍보 종료"}`);
  }
  const bill = dailyUpkeep();
  const paid = Math.min(state.gold, bill);
  state.gold -= paid;
  state.debt += bill - paid;
  state.debtDays = state.debt > 0 ? state.debtDays + 1 : 0;
  log("일일 정산", `${state.day}일차 · 유지비 ${count(paid)}골드 지불${state.debt ? ` · 미납 ${count(state.debt)}골드` : ""}`);
  if (!state.openingRewardClaimed) {
    state.openingRewardClaimed = true;
    state.stone += FIRST_EXPANSION_STONE;
    state.gold += OPENING_REWARD_GOLD;
    log("초반 운영 목표 달성", `침입 후 정산 완료 · 골드 +${OPENING_REWARD_GOLD} · 석재 +${FIRST_EXPANSION_STONE}개`);
  }
  if (isBankrupt()) log("파산", "미납금이 3일 연속 남아 던전 운영이 종료되었습니다.");
}

function recoverFleeingHero(step, hero, trap) {
  if (!trap?.recoveryChance || hero.checkedRecoveryRooms.has(step.id)) return;
  hero.checkedRecoveryRooms.add(step.id);
  if (Math.random() >= trap.recoveryChance) return;
  animateTrap(step);
  hero.hp = Math.ceil(hero.maxHp * trap.recoveryRatio);
  hero.retreating = false;
  hero.escape = 0;
  updateHeroMarker(hero);
  log("함정 발동", `${step.label} · ${trap.name} · ${hero.name} 체력 ${hero.hp}/${hero.maxHp} 회복 · 탐색 재개`, "intrusion");
}

async function strikeFleeingHero(step, hero, unit) {
  if (!unit || hero.checkedPursuitRooms.has(step.id)) return;
  hero.checkedPursuitRooms.add(step.id);
  if (Math.random() >= ESCAPE_HIT_CHANCE) {
    log("도망 중 회피", `${step.label} · ${hero.name}가 ${unit.monster.name}의 추격을 피했습니다.`, "intrusion");
    return;
  }
  unit.opponent = hero;
  unit.attacking = true;
  hero.escape--;
  refreshSlots();
  updateHeroMarker(hero);
  log("도망 중 피격", `${step.label} · ${unit.monster.name} → ${hero.name} · 도망 게이지 ${hero.escape}/${ESCAPE_SEGMENTS}`, "intrusion");
  try {
    await wait(WALK_FRAME_MS * WALK_POSES.length);
  } finally {
    unit.attacking = false;
    unit.opponent = null;
    refreshSlots();
  }
}

async function exploreDungeon(route, hero, fromThrone = false) {
  if (!fromThrone) visitRoom(route[0], hero);
  await wait(STEP_MS);
  let index = fromThrone ? route.length - 2 : 1;
  while (index > 0 && index < route.length - 1) {
    const step = route[index];
    const installed = state.traps.get(step.id);
    const trap = installed && trapFloorUnlocked(installed) ? installed : undefined;
    const slots = state.workshops.has(step.id) ? [] : occupants(step.id);
    const defenderSlot = slots.findIndex((unit) => unit && !unit.reviveAt && !unit.opponent);
    const defender = slots[defenderSlot];
    const busy = !defender && slots.some((unit) => unit && !unit.reviveAt);
    visitRoom(step, hero);
    if (hero.retreating) {
      recoverFleeingHero(step, hero, trap);
      if (hero.retreating) {
        await strikeFleeingHero(step, hero, defender);
        if (hero.escape === 0) {
          hero.raid.rooms.get(step.id).repelled.add(hero);
          state.infamy++;
          if (Math.random() < 0.10) {
            state.relics++;
            hero.raid.relics++;
          }
          renderDungeonStats();
          log("용사 사망", `${step.label} · ${hero.name} 사망 · 던전 악명 +1`, "intrusion");
          return { outcome: "사망" };
        }
        index--;
        await wait(STEP_MS);
        continue;
      }
      if (defender) await fightRoom(step, hero, defender, defenderSlot, trap);
      if (hero.paidToll) return { outcome: "통행료 귀환" };
      index += hero.retreating ? -1 : 1;
      await wait(STEP_MS);
      continue;
    }

    if (hero.teleportChance && Math.random() < hero.teleportChance) {
      log("순간이동", `${hero.name}가 ${step.label}을(를) 건너 ${route[index + 1].label}(으)로 이동합니다.`, "intrusion");
      index++;
      continue;
    }
    if (trap?.chance && !hero.raid.checkedGates.has(step.id)) {
      hero.raid.checkedGates.add(step.id);
      if (Math.random() < trap.chance) {
        animateTrap(step);
        log("함정 발동", `${step.label} · ${trap.name} · ${hero.name}가 ${route[index - 1].label}(으)로 밀려났습니다.`, "intrusion");
        index--;
        await wait(STEP_MS);
        if (index === 0) {
          visitRoom(route[0], hero);
          await wait(STEP_MS);
          index++;
        }
        continue;
      }
    }
    triggerEntryTrap(step, hero, trap);
    checkTollDecision(hero);
    if (hero.paidToll) return { outcome: "통행료 귀환" };
    if (hero.hp === 0) {
      startRetreat(step, hero);
    } else {
      updateHeroMarker(hero);
      if (defender) await fightRoom(step, hero, defender, defenderSlot, trap);
      else if (busy) {
        hero.raid.rooms.get(step.id).passed.add(hero);
        log("방 통과", `${step.label} · ${hero.name} 통과 · 모든 수비 몬스터 교전 중`, "intrusion");
      }
    }
    if (hero.paidToll) return { outcome: "통행료 귀환" };
    index += hero.retreating ? -1 : 1;
    await wait(STEP_MS);
  }

  if (hero.retreating) {
    visitRoom(route[0], hero);
    await wait(STEP_MS);
    log("던전 탈출", `${hero.name}가 시작방을 통해 던전을 빠져나갔습니다.`, "intrusion");
    return { outcome: "탈출" };
  }

  visitRoom(route.at(-1), hero);
  log("마왕방 도착", `${hero.name}가 체력 ${hero.hp}을(를) 남기고 마왕방에 도착했습니다.`, "intrusion");
  await wait(STEP_MS);
  return { outcome: "마왕방 도착" };
}

async function retreatFromThrone(route, hero) {
  startRetreat(route.at(-1), hero);
  hero.raid.active.add(hero);
  const result = await exploreDungeon(route, hero, true);
  hero.raid.active.delete(hero);
  clearTimeout(hero.walkTimer);
  if (result.outcome !== "마왕방 도착") hero.marker.remove();
  if (hero.paidToll) {
    log("통행료 귀환", `${hero.name} · 마을로 순간이동`, "intrusion");
  }
  return result;
}

async function fightThrone(route, party, finalResults) {
  const health = byId("demon-health");
  const maxHp = demonMaxHp();
  let hp = maxHp;
  let fighters = party;
  let retreats = [];
  byId("route-status").textContent = `마왕방 레이드 · 용사 ${party.length}명 참전`;
  log("마왕방 레이드", `${state.demonName} vs 용사 ${party.length}명 · 체력 ${maxHp} · 공격력 ${demonAttack()}`, "intrusion");

  while (hp > 0 && (fighters.length || retreats.length)) {
    if (!fighters.length) {
      fighters = (await Promise.all(retreats)).filter((hero) => finalResults.get(hero).outcome === "마왕방 도착");
      retreats = [];
      continue;
    }
    let damage = 0;
    for (const hero of fighters) {
      setHeroPose(hero, "attack");
      const critical = hero.criticalChance && Math.random() < hero.criticalChance;
      damage += hero.attack * (critical ? hero.criticalMultiplier : 1);
    }
    hp = Math.max(0, hp - damage);
    health.value = hp;
    health.title = `${state.demonName} 체력 ${hp}/${maxHp}`;
    log("용사 합동 공격", `용사 ${fighters.length}명 · 피해 ${damage} · 마왕 체력 ${hp}/${maxHp}`, "intrusion");
    await wait(ATTACK_TURN_MS);
    for (const hero of fighters) setHeroPose(hero, "idle");
    if (hp === 0) break;

    const target = fighters[0];
    if (target.dodgeChance && Math.random() < target.dodgeChance) {
      log("마왕 공격 회피", `${target.name}가 공격을 피했습니다.`, "intrusion");
    } else {
      target.hp = Math.max(0, target.hp - demonAttack());
      updateHeroMarker(target, state.demonName);
      if (target.hp === 0) {
        fighters = fighters.slice(1);
        retreats.push(retreatFromThrone(route, target).then((result) => {
          finalResults.set(target, result);
          return target;
        }));
      }
    }
    await wait(ATTACK_TURN_MS);
  }

  await Promise.all(retreats);
  if (hp > 0) {
    log("마왕방 방어 성공", `${state.demonName} 생존 · 체력 ${hp}/${maxHp}`, "intrusion");
    return false;
  }

  const total = state.throneReward * party.length;
  const paid = Math.min(state.gold, total);
  const unpaid = total - paid;
  state.gold -= paid;
  state.debt += unpaid;
  byId("gold").textContent = count(state.gold);
  log("마왕 처치 보상", `${count(state.throneReward)}골드 × ${party.length}명 = ${count(total)}골드 · 보유 골드 -${count(paid)}${unpaid ? ` · 미납금 +${count(unpaid)}골드` : ""}`, "intrusion");
  return true;
}

async function runRoute() {
  if (state.running || isBankrupt()) return;
  state.running = true;
  const openingBalance = state.gold - state.debt;
  const logs = byId("logs");
  while (logs.children.length > 80) logs.lastElementChild.remove();
  rollWorkshopAccidents();
  renderManagement();
  const route = buildRoute(state.floors);
  const baseHp = (70 + (state.level - 1) * 6) * HEALTH_MULTIPLIER;
  const baseAttack = 14 + (state.level - 1) * 2;
  const { size, honorCount, honorPower } = raidProfile();
  const rooms = route.slice(1, -1).map(({ id, label }) => [id, {
    label, repelled: new Set(), passed: new Set(), hitTrapTriggered: new Set(),
  }]);
  const raid = { active: new Set(), checkedGates: new Set(), rooms: new Map(rooms), bountyGold: 0, relics: 0 };
  const heroes = Array.from({ length: size }, (_, index) => {
    const heroClass = HERO_CLASSES[index % HERO_CLASSES.length];
    const rotatedIndex = (index + state.day) % size;
    const honor = Math.floor((rotatedIndex + 1) * honorCount / size) > Math.floor(rotatedIndex * honorCount / size);
    const name = honor ? `명예 용사 · ${heroClass.name}` : heroClass.name;
    const maxHp = honor ? Math.ceil(baseHp * honorPower / 100) : baseHp;
    const attack = honor ? Math.ceil(baseAttack * honorPower / 100) : baseAttack;
    const marker = element("span", honor ? "hero-marker hero-honor" : "hero-marker");
    const image = makeSprite(heroClass.sprite);
    const health = makeHealthBar(name, maxHp);
    const escapeBar = element("span", "escape-bar");
    escapeBar.hidden = true;
    escapeBar.setAttribute("role", "progressbar");
    escapeBar.setAttribute("aria-label", `${name} 도망 게이지`);
    escapeBar.setAttribute("aria-valuemin", "0");
    escapeBar.setAttribute("aria-valuemax", ESCAPE_SEGMENTS);
    for (let segment = 0; segment < ESCAPE_SEGMENTS; segment++) {
      escapeBar.append(element("span"));
    }
    marker.setAttribute("role", "group");
    if (honor) marker.append(element("span", "honor-badge", "명예"));
    marker.append(image, health, escapeBar);
    return {
      ...heroClass, name, hp: maxHp, maxHp, attack, raid, marker, image, health, escapeBar,
      retreating: false, escape: 0, checkedRecoveryRooms: new Set(), checkedPursuitRooms: new Set(),
      checkedToll: false, paidToll: false,
    };
  });
  for (const unit of deployed()) {
    if (!unit.reviveAt) unit.hp = unit.monster.hp;
  }
  refreshSlots();
  let remaining = heroes.length;
  const showRaidStatus = () => {
    byId("route-status").textContent = `침입 진행 중 · 남은 용사 ${remaining}명`;
  };
  showRaidStatus();

  const results = await Promise.all(heroes.map(async (hero, index) => {
    if (index > 0) await wait(index * HERO_ENTRY_MS);
    raid.active.add(hero);
    log("용사 입장", `${hero.name} 입장 · 체력 ${hero.maxHp} · 공격 ${hero.attack}`, "intrusion");
    const result = await exploreDungeon(route, hero);
    state.gold += HERO_TOLL;
    byId("gold").textContent = count(state.gold);
    renderWorkshops();
    if (hero.paidToll) {
      log("통행료 귀환", `${hero.name} · ${HERO_TOLL}골드 지불 · 마을로 순간이동`, "intrusion");
    }
    clearTimeout(hero.walkTimer);
    if (result.outcome !== "마왕방 도착") hero.marker.remove();
    raid.active.delete(hero);
    remaining--;
    showRaidStatus();
    return result;
  }));
  const party = heroes.filter((_, index) => results[index].outcome === "마왕방 도착");
  const throneRetreats = new Map();
  const demonDefeated = party.length > 0 && await fightThrone(route, party, throneRetreats);
  for (const hero of party) hero.marker.remove();
  const finalResults = results.map((result, index) => throneRetreats.get(heroes[index]) ?? result);
  const { bountyGold, relics } = raid;
  const escaped = finalResults.filter((result) => result.outcome === "탈출").length;
  recordEscapes(escaped, heroes.length);
  const summary = ["사망", "탈출", "통행료 귀환"].map((outcome) =>
    `${outcome} ${finalResults.filter((result) => result.outcome === outcome).length}명`).join(" · ");
  state.level++;
  log("침입 종료", `마왕 Lv. ${state.level} · 통행료 ${heroes.length}명 × ${HERO_TOLL}골드 = ${heroes.length * HERO_TOLL}골드${bountyGold ? ` · 현상금 +${bountyGold}골드` : ""}${relics ? ` · 고대 유물 +${relics}` : ""}`);
  advanceDay();
  renderRaidResult(raid, party.length, state.gold - state.debt - openingBalance);
  state.running = false;
  const throneResult = party.length ? (demonDefeated ? " · 마왕 처치" : " · 마왕방 방어 성공") : "";
  byId("route-status").textContent = `${summary} · 마왕방 도달 ${party.length}명${throneResult} · ${isBankrupt() ? "파산" : `${state.day}일차 시작`}`;
  renderManagement();
  if (isBankrupt()) byId("restart-game").focus();
}

function renderRaidResult(raid, reachedThrone, net) {
  const summary = byId("raid-result");
  summary.hidden = false;
  byId("raid-result-title").textContent = `${state.day - 1}일차 침입 및 정산 결과`;
  byId("raid-result-totals").textContent = `순손익 ${net > 0 ? "+" : ""}${count(net)}골드 · 마왕방 도달 ${reachedThrone}명`;
  const rows = byId("raid-result-rooms");
  rows.replaceChildren();
  for (const { label, repelled, passed } of raid.rooms.values()) {
    const row = element("tr");
    const heading = element("th", "", label);
    heading.scope = "row";
    row.append(heading, element("td", "", `${repelled.size}명`), element("td", "", `${passed.size}명`));
    rows.append(row);
  }
}

function expandFloor() {
  const cost = expansionCost(state.floors);
  if (expansionBlocker(cost)) return;
  for (const [resource, amount] of Object.entries(cost)) state[resource] -= amount;
  state.floors++;
  renderMap();
  renderManagement();
  byId("route-status").textContent = "새 경로를 테스트할 수 있습니다.";
  log("증축 완료", `${state.floors}층을 열고 마왕방을 꼭대기로 옮겼습니다.`);
}


buildMonsterCatalog();
buildTrapCatalog();
renderMap();
renderManagement();
for (const [units, poses] of [
  [MONSTERS, ["attack"]],
  [HERO_CLASSES, ["idle", "walk-1", "walk-2", "attack"]],
  [TRAPS, ["active"]],
]) {
  for (const unit of units) {
    for (const pose of poses) new Image().src = spriteUrl(unit.sprite, pose);
  }
}
byId("start-route").addEventListener("click", runRoute);
byId("debt-payment-form").addEventListener("submit", payDebt);
byId("bank-loan-form").addEventListener("submit", takeLoan);
byId("bank-loan").addEventListener("input", renderLoanPreview);
byId("restart-game").addEventListener("click", () => window.location.reload());
byId("throne-reward-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const reward = byId("throne-reward").valueAsNumber;
  if (state.running || !Number.isInteger(reward) || reward < 0 || reward > MAX_THRONE_REWARD) return;
  state.throneReward = reward;
  renderManagement();
});
byId("open-activities").addEventListener("click", () => {
  renderActivities();
  byId("activities-dialog").showModal();
});
byId("promotion-buy").addEventListener("click", promoteDungeon);
byId("expand-floor").addEventListener("click", expandFloor);
byId("dismiss-monster").addEventListener("click", dismissMonster);
byId("monster-move-form").addEventListener("submit", moveMonster);
byId("remove-trap").addEventListener("click", removeTrap);
byId("open-game-settings").addEventListener("click", openGameSettings);
byId("name-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.running) return;
  if (applyNames()) byId("save-status").textContent = "이름을 적용했습니다. 다음에도 쓰려면 게임을 저장하세요.";
});
byId("save-game").addEventListener("click", saveGame);
byId("load-game").addEventListener("click", loadGame);
byId("route-status").textContent = "용사를 불러 던전 방어를 시작하세요.";
log("운영 시작", `1층에 일반방 ${ROOMS_PER_FLOOR}개와 마왕방이 열렸습니다.`);
