// UI 확인용 예시 데이터. 게임이 추가되면 동일한 구조의 게임 상태를 렌더에 전달한다.
const previewState = {
  gold: 1250,
  management: {
    dungeon: {
      title: "던전 현황",
      description: "마왕의 왕좌가 있는 지하 1층입니다.",
      stats: [
        ["던전 등급", "Lv. 1"],
        ["개방 구역", "3개"],
        ["보유 몬스터", "4마리"],
        ["설치한 함정", "2개"],
      ],
    },
    monsters: {
      title: "몬스터 현황",
      description: "던전에 배치된 몬스터 목록입니다.",
      stats: [["고블린", "2마리"], ["해골 병사", "1마리"], ["슬라임", "1마리"]],
    },
    traps: {
      title: "함정 현황",
      description: "던전에 설치된 함정 목록입니다.",
      stats: [["가시 함정", "입구 통로"], ["낙석 함정", "왕좌 앞 복도"]],
    },
  },
  logs: [
    { time: "08:12", kind: "intrusion", category: "용사 침입", message: "용사 일행이 던전 입구에 나타났습니다." },
    { time: "08:14", kind: "combat", category: "전투", message: "고블린 경비대가 첫 번째 통로에서 용사 일행과 조우했습니다." },
    { time: "08:16", kind: "management", category: "경영 이벤트", message: "던전 운영을 위한 초기 자금 1,250골드가 지급되었습니다." },
  ],
};

function renderDashboard(state) {
  document.querySelector("#gold").textContent = state.gold.toLocaleString("ko-KR");

  const panelTemplate = document.querySelector("#panel-template");
  const statTemplate = document.querySelector("#stat-template");
  for (const [key, entry] of Object.entries(state.management)) {
    const panel = panelTemplate.content.cloneNode(true);
    panel.querySelector("h3").textContent = entry.title;
    panel.querySelector("p").textContent = entry.description;
    const stats = panel.querySelector("dl");
    for (const [label, value] of entry.stats) {
      const stat = statTemplate.content.cloneNode(true);
      stat.querySelector("dt").textContent = label;
      stat.querySelector("dd").textContent = value;
      stats.append(stat);
    }
    document.getElementById(`panel-${key}`).replaceChildren(panel);
  }

  const logTemplate = document.querySelector("#log-template");
  const rows = state.logs.map(({ time, kind, category, message }) => {
    const row = logTemplate.content.cloneNode(true);
    row.querySelector("li").dataset.kind = kind;
    const timestamp = row.querySelector("time");
    timestamp.dateTime = time;
    timestamp.textContent = time;
    row.querySelector(".log-category").textContent = category;
    row.querySelector(".log-message").textContent = message;
    return row;
  });
  document.querySelector("#logs").replaceChildren(...rows);
}

function bindManagementTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function selectTab(selectedTab) {
    for (const tab of tabs) {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      const nextByKey = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = nextByKey[event.key];
      if (typeof next !== "number") return;
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
}

renderDashboard(previewState);
bindManagementTabs();
