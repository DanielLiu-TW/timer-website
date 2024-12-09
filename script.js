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
const auth = firebase.auth();
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

    // 創建時間顯示
    const timeDisplay = document.createElement("span");
    timeDisplay.className = "time-display";
    timerElement.appendChild(timeDisplay);

    // 創建開始/暫停按鈕
    const startPauseButton = document.createElement("button");
    startPauseButton.className = "start-pause-btn";
    startPauseButton.addEventListener("click", () => {
      if (timerData.isRunning) {
        pauseTimer(timeDisplay, timerId);
      } else {
        startTimer(timeDisplay, timerId);
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
  const timeDisplay = timerElement.querySelector(".time-display");
  const startPauseButton = timerElement.querySelector(".start-pause-btn");

  timeDisplay.textContent =
    timerData.remainingTime >= 0
      ? `倒數：${formatTime(timerData.remainingTime)}`
      : `逾時：${formatTime(-timerData.remainingTime)}`;
  timeDisplay.dataset.remainingTime = timerData.remainingTime;

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

// 檢查用戶登錄狀態
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("已登錄:", user);
    currentUser = user;

    // 驗證是否為控制者
    if (user.uid === "KMP11IC7TwabAuSigVmri3bMfKp1") {
      console.log("已驗證為控制者");
      startAllButton.disabled = false;
      resetAllButton.disabled = false;
    } else {
      console.log("非控制者，僅可檢視");
    }
  } else {
    console.log("未登錄，請登錄");
  }
});

// 設置 Firebase 登錄持久性為 LOCAL 並進行登錄
firebase.auth()
  .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()))
  .catch((error) => {
    console.error("登入失敗:", error.message);
  });

// 本地計時邏輯和 Firebase 同步
function startTimer(display, timerId) {
  if (display.timerId) return;

  display.timerId = setInterval(() => {
    let time = parseInt(display.dataset.remainingTime, 10);
    time -= 1;
    display.dataset.remainingTime = time;

    // 寫入 Firebase
    timerRef.child(timerId).update({
      remainingTime: time,
      isRunning: true
    });

    if (time < 0) {
      display.textContent = `逾時：${formatTime(-time)}`;
      display.classList.add("overdue");
    } else {
      display.textContent = `倒數：${formatTime(time)}`;
    }
  }, 1000);
}

function pauseTimer(display, timerId) {
  if (display.timerId) {
    clearInterval(display.timerId);
    delete display.timerId;

    // 更新 Firebase 狀態
    timerRef.child(timerId).update({
      isRunning: false
    });
  }
}

function resetTimer(timerId) {
  timerRef.child(timerId).update({
    remainingTime: 600,
    isRunning: false
  });
}

// 工具函數
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
