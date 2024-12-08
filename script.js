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
  
  const timerRef = db.ref('timers');
  
  // DOM 元素
  const container = document.getElementById("timers-container");
  const startAllButton = document.getElementById("start-all");
  const resetAllButton = document.getElementById("reset-all");
  const adjustTimeButton = document.getElementById("adjust-time");
  const timerSelector = document.getElementById("timer-selector");
  
  // 初始化狀態
  let currentUser = null;
  
  // 更新計時器 UI
  function updateTimerUI(timerId, timerData) {
      const timerElement = document.getElementById(timerId);
      if (!timerElement) return;
  
      const timeDisplay = timerElement.querySelector("span");
      const startPauseButton = timerElement.querySelector("button:first-of-type");
  
      timeDisplay.textContent = timerData.remainingTime >= 0
          ? `倒數：${formatTime(timerData.remainingTime)}`
          : `逾時：${formatTime(-timerData.remainingTime)}`;
      timeDisplay.dataset.remainingTime = timerData.remainingTime;
  
      if (timerData.remainingTime < 0) {
          timeDisplay.classList.add("overdue");
          timerElement.classList.add("overdue");
      } else {
          timeDisplay.classList.remove("overdue");
          timerElement.classList.remove("overdue");
      }
  
      startPauseButton.textContent = timerData.isRunning ? "暫停" : "開始";
  
      if (timerData.isRunning) {
          startTimer(timeDisplay);
      } else {
          pauseTimer(timeDisplay);
      }
  }
  
  // 初始化計時器
  timerRef.on('value', (snapshot) => {
      const timers = snapshot.val() || {};
      Object.keys(timers).forEach(timerId => {
          updateTimerUI(timerId, timers[timerId]);
      });
  });

// 檢查用戶登錄狀態
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("已登錄:", user);
    // 驗證是否為控制者
    if (user.uid === "KMP11IC7TwabAuSigVmri3bMfKp1") {
      console.log("已驗證為控制者");
      startAllButton.disabled = false;
      resetAllButton.disabled = false;
      adjustTimeButton.disabled = false;
    } else {
      console.log("非控制者，僅可檢視");
    }
  } else {
    console.log("未登錄，請登錄");
    // 如果沒有登錄，顯示登錄界面或進行登錄
  }
});

  // 設置 Firebase 登錄持久性為 LOCAL
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // 在這裡進行 Google 登錄
    return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  })
  .then((result) => {
    const user = result.user;
    console.log("成功登錄用戶:", user);

    // 驗證是否為控制者
    if (user.uid === "KMP11IC7TwabAuSigVmri3bMfKp1") {
      console.log("已驗證為控制者");
      startAllButton.disabled = false;
      resetAllButton.disabled = false;
      adjustTimeButton.disabled = false;
    } else {
      console.log("非控制者，僅可檢視");
    }
  })
  .catch((error) => {
    console.error("登入失敗:", error.message);
    console.error("錯誤代碼:", error.code);
  });


  // 本地計時邏輯和 Firebase 同步集成
  function startTimer(display) {
      if (display.timerId) return;
  
      display.timerId = setInterval(() => {
          let time = parseInt(display.dataset.remainingTime, 10);
          time -= 1;
          display.dataset.remainingTime = time;
  
          // 寫入 Firebase
          timerRef.child(display.closest(".timer").id).update({
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
  
  function pauseTimer(display) {
      if (display.timerId) {
          clearInterval(display.timerId);
          delete display.timerId;
  
          // 更新 Firebase 狀態
          timerRef.child(display.closest(".timer").id).update({
              isRunning: false
          });
      }
  }
  
  // 工具函數
  function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  
