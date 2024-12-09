// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyBmhwIKZwJHRbb_z2UZw6fQwzuZJTbmZQ8",
  authDomain: "timer-control-e6036.firebaseapp.com",
  databaseURL: "https://timer-control-e6036-default-rtdb.firebaseio.com",
  projectId: "timer-control-e6036",
  storageBucket: "timer-control-e6036.appspot.com",
  messagingSenderId: "568777043775",
  appId: "1:568777043775:web:ad1559dbd0909a4132ad8a",
  measurementId: "G-W288ZF1TFR"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const timerRef = db.ref("timers");

// DOM 元素
const container = document.getElementById("timers-container");
const startAllButton = document.getElementById("start-all");
const resetAllButton = document.getElementById("reset-all");

// 初始化狀態
let currentUser = null;

// 更新計時器 UI
function updateTimerUI(timerId, timerData) {
  let timerElement = document.getElementById(timerId);

  // 如果元素不存在，創建新的計時器元素
  if (!timerElement) {
    timerElement = document.createElement("div");
    timerElement.id = timerId;
    timerElement.classList.add("timer");

    // 創建名稱顯示（支持雙擊修改）
    const nameDisplay = document.createElement("div");
    nameDisplay.className = "name-display";
    nameDisplay.textContent = timerData.name || `計時器 ${timerId}`;
    nameDisplay.addEventListener("dblclick", () => editTimerName(timerId, nameDisplay));
    timerElement.appendChild(nameDisplay);

    // 創建時間顯示
    const timeDisplay = document.createElement("span");
    timeDisplay.className = "time-display";
    timerElement.appendChild(timeDisplay);

    // 創建開始/暫停按鈕
    const startPauseButton = document.createElement("button");
    startPauseButton.className = "start-pause-btn";
    startPauseButton.addEventListener("click", () => {
      if (timerData.isRunning) {
        pauseTimer(timerId);
      } else {
        startTimer(timerId);
      }
    });
    timerElement.appendChild(startPauseButton);

    // 創建重置按鈕
    const resetButton = document.createElement("button");
    resetButton.className = "reset-btn";
    resetButton.textContent = "重置";
    resetButton.addEventListener("click", () => resetTimer(timerId));
    timerElement.appendChild(resetButton);

    // 添加計時器到容器
    container.appendChild(timerElement);
  }

  // 更新 UI
  const nameDisplay = timerElement.querySelector(".name-display");
  const timeDisplay = timerElement.querySelector(".time-display");
  const startPauseButton = timerElement.querySelector(".start-pause-btn");

  nameDisplay.textContent = timerData.name || `計時器 ${timerId}`;
  timeDisplay.textContent =
    timerData.remainingTime >= 0
      ? `倒數：${formatTime(timerData.remainingTime)}`
      : `逾時：${formatTime(-timerData.remainingTime)}`;
  startPauseButton.textContent = timerData.isRunning ? "暫停" : "開始";

  if (timerData.remainingTime < 0) {
    timeDisplay.classList.add("overdue");
    timerElement.classList.add("overdue");
  } else {
    timeDisplay.classList.remove("overdue");
    timerElement.classList.remove("overdue");
  }
}


// 監聽 Firebase 數據變化
timerRef.on("value", (snapshot) => {
  const timers = snapshot.val() || {};

  // 清空計時器容器以避免重複添加
  container.innerHTML = "";

  Object.keys(timers).forEach((timerId) => {
    updateTimerUI(timerId, timers[timerId]);
  });
});

// 開始計時
function startTimer(timerId) {
  timerRef.child(timerId).update({
    isRunning: true
  });
}

// 暫停計時
function pauseTimer(timerId) {
  timerRef.child(timerId).update({
    isRunning: false
  });
}

// 重置計時器
function resetTimer(timerId) {
  timerRef.child(timerId).update({
    remainingTime: 600, // 重置為 10 分鐘
    isRunning: false
  });
}

// 全局開始/暫停
startAllButton.addEventListener("click", () => {
  timerRef.once("value", (snapshot) => {
    const timers = snapshot.val() || {};
    Object.keys(timers).forEach((timerId) => {
      timerRef.child(timerId).update({ isRunning: true });
    });
  });
});

// 全局重置
resetAllButton.addEventListener("click", () => {
  timerRef.once("value", (snapshot) => {
    const timers = snapshot.val() || {};
    Object.keys(timers).forEach((timerId) => {
      timerRef.child(timerId).update({
        remainingTime: 600,
        isRunning: false
      });
    });
  });
});

// 編輯計時器名稱
function editTimerName(timerId, nameDisplay) {
  const newName = prompt("請輸入新的計時器名稱：", nameDisplay.textContent);
  if (newName) {
    timerRef.child(timerId).update({ name: newName });
  }
}

// 工具函數
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
