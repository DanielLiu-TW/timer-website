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
const adjustTimeButton = document.getElementById("adjust-time");
const timerSelector = document.getElementById("timer-selector");
const addTimeInput = document.getElementById("add-time");

// 初始化狀態
let currentUser = null;

// Firebase 登錄狀態檢查
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    console.log(`用戶已登入：${user.email}`);
    if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
      alert("您僅可檢視，無法修改計時器！");
    }
  } else {
    console.log("未登入，請先登入");
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(console.error);
  }
});

// 更新計時器 UI
function updateTimerUI(timerId, timerData) {
  let timerElement = document.getElementById(timerId);

  if (!timerElement) {
    timerElement = document.createElement("div");
    timerElement.id = timerId;
    timerElement.className = "timer";

    // 創建名稱顯示
    const titleDisplay = document.createElement("div");
    titleDisplay.className = "title";
    titleDisplay.textContent = timerData.title || `計時器 ${timerId}`;
    titleDisplay.addEventListener("dblclick", () => {
      if (currentUser.uid === "KMP11IC7TwabAuSigVmri3bMfKp1") {
        enterEditMode(titleDisplay, timerId);
      } else {
        alert("您無權修改計時器名稱！");
      }
    });
    timerElement.appendChild(titleDisplay);

    // 創建時間顯示
    const timeDisplay = document.createElement("span");
    timeDisplay.className = "time-display";
    timeDisplay.dataset.remainingTime = timerData.remainingTime || 600;
    timeDisplay.textContent = formatTime(timerData.remainingTime || 600);
    timerElement.appendChild(timeDisplay);

    // 創建按鈕
    const startPauseButton = document.createElement("button");
    startPauseButton.textContent = timerData.isRunning ? "暫停" : "開始";
    startPauseButton.onclick = () => toggleStartPause(timeDisplay, startPauseButton, timerId);
    timerElement.appendChild(startPauseButton);

    const resetButton = document.createElement("button");
    resetButton.textContent = "重置";
    resetButton.onclick = () => resetTimer(timerId);
    timerElement.appendChild(resetButton);

    container.appendChild(timerElement);

    // 更新下拉選單
    const option = document.createElement("option");
    option.value = timerId;
    option.textContent = timerData.title || `計時器 ${timerId}`;
    timerSelector.appendChild(option);
  }

  // 更新計時器狀態
  const titleDisplay = timerElement.querySelector(".title");
  const timeDisplay = timerElement.querySelector(".time-display");
  const startPauseButton = timerElement.querySelector("button:first-of-type");

  titleDisplay.textContent = timerData.title || `計時器 ${timerId}`;
  timeDisplay.dataset.remainingTime = timerData.remainingTime || 600;
  timeDisplay.textContent = formatTime(timerData.remainingTime || 600);
  startPauseButton.textContent = timerData.isRunning ? "暫停" : "開始";
}

// 監聽 Firebase 數據
timerRef.on("value", (snapshot) => {
  const timers = snapshot.val() || {};
  container.innerHTML = "";
  timerSelector.innerHTML = ""; // 清空下拉選單
  Object.keys(timers).forEach((timerId) => updateTimerUI(timerId, timers[timerId]));
});

// 開始/暫停
function toggleStartPause(display, button, timerId) {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權操作計時器！");
    return;
  }
  const isRunning = button.textContent === "開始";
  timerRef.child(timerId).update({ isRunning });
  button.textContent = isRunning ? "暫停" : "開始";
}

// 重置計時器
function resetTimer(timerId) {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權操作計時器！");
    return;
  }
  timerRef.child(timerId).update({ remainingTime: 600, isRunning: false });
}

// 全局開始
startAllButton.addEventListener("click", () => {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權操作計時器！");
    return;
  }
  timerRef.once("value", (snapshot) => {
    const updates = {};
    snapshot.forEach((child) => {
      updates[`${child.key}/isRunning`] = true;
    });
    timerRef.update(updates);
  });
});

// 全局重置
resetAllButton.addEventListener("click", () => {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權操作計時器！");
    return;
  }
  timerRef.once("value", (snapshot) => {
    const updates = {};
    snapshot.forEach((child) => {
      updates[`${child.key}/remainingTime`] = 600;
      updates[`${child.key}/isRunning`] = false;
    });
    timerRef.update(updates);
  });
});

// 調整時間
adjustTimeButton.addEventListener("click", () => {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權操作計時器！");
    return;
  }
  const timerId = timerSelector.value;
  const adjustment = parseInt(addTimeInput.value, 10);
  if (timerId && !isNaN(adjustment)) {
    timerRef.child(timerId).once("value", (snapshot) => {
      const newTime = (snapshot.val().remainingTime || 0) + adjustment;
      timerRef.child(timerId).update({ remainingTime: newTime });
      addTimeInput.value = ""; // 清空輸入框
    });
  } else {
    alert("請選擇計時器並輸入有效的數值！");
  }
});

// 修改名稱
function enterEditMode(titleDisplay, timerId) {
  if (currentUser.uid !== "KMP11IC7TwabAuSigVmri3bMfKp1") {
    alert("您無權修改名稱！");
    return;
  }
  const newName = prompt("請輸入新的名稱：", titleDisplay.textContent);
  if (newName) {
    timerRef.child(timerId).update({ title: newName });
  }
}

// 格式化時間
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
