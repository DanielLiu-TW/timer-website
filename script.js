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
