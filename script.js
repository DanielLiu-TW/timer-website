document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("timers-container");
    const startAllButton = document.getElementById("start-all");
    const resetAllButton = document.getElementById("reset-all");
    const adjustTimeButton = document.getElementById("adjust-time");
    const timerSelector = document.getElementById("timer-selector");

    const savedState = JSON.parse(localStorage.getItem("timersState")) || {
        timers: {},
        isStartAllDisabled: false,
    };

    console.log("Restoring saved state:", savedState); // 除錯訊息

    // 初始化計時器
    for (let i = 1; i <= 10; i++) {
        createTimer(i, savedState.timers[`timer${i}`]);
    }

    // 恢復一鍵開始按鈕狀態
    startAllButton.disabled = savedState.isStartAllDisabled;
    startAllButton.style.backgroundColor = savedState.isStartAllDisabled ? "gray" : "";

    // 綁定事件
    startAllButton.addEventListener("click", toggleAllTimers);
    resetAllButton.addEventListener("click", resetAllTimers);
    adjustTimeButton.addEventListener("click", adjustTime);

    // 保存計時器狀態
    window.addEventListener("beforeunload", saveTimersState);
});

function toggleAllTimers() {
    const timers = document.querySelectorAll(".timer span");
    const isAnyRunning = Array.from(timers).some(timer => timer.timerId);

    timers.forEach(timer => {
        const button = timer.closest(".timer").querySelector("button:first-of-type");
        if (isAnyRunning) {
            pauseTimer(timer);
            button.textContent = "開始";
        } else {
            startTimer(timer);
            button.textContent = "暫停";
        }
    });

    // 檢查是否需要禁用一鍵開始按鈕
    const startAllButton = document.getElementById("start-all");
    const allTimersStopped = Array.from(timers).every(timer => !timer.timerId);
    startAllButton.disabled = !allTimersStopped;
    startAllButton.style.backgroundColor = allTimersStopped ? "" : "gray";
}

function resetAllTimers() {
    if (!confirm("確定要一鍵重製所有計時器嗎？")) return;

    const timers = document.querySelectorAll(".timer");
    timers.forEach(timer => {
        const timeDisplay = timer.querySelector("span");
        const button = timer.querySelector("button:first-of-type");
        pauseTimer(timeDisplay);
        timeDisplay.dataset.remainingTime = 1200; // 一鍵重製為 20 分鐘
        timeDisplay.textContent = `倒數：20:00`;
        timeDisplay.classList.remove("overdue");
        timer.classList.remove("overdue");
        button.textContent = "開始";
    });

    // 恢復一鍵開始按鈕
    const startAllButton = document.getElementById("start-all");
    startAllButton.disabled = false;
    startAllButton.style.backgroundColor = "";
    startAllButton.textContent = "一鍵開始";
}


function createTimer(index, savedState = null) {
    console.log(`Creating timer ${index}`); // 除錯訊息
    const timerDiv = document.createElement("div");
    timerDiv.className = "timer";
    timerDiv.id = `timer${index}`;

    const titleDisplay = document.createElement("div");
    titleDisplay.className = "title";
    titleDisplay.textContent = savedState?.title || `計時器 ${index}`;
    titleDisplay.addEventListener("dblclick", () => enterEditMode(titleDisplay));

    const timeDisplay = document.createElement("span");
    const remainingTime = savedState?.remainingTime || 1200; // 初始時間 20 分鐘
    timeDisplay.dataset.remainingTime = remainingTime;
    timeDisplay.textContent = `倒數：${formatTime(remainingTime)}`;

    const startPauseButton = document.createElement("button");
    startPauseButton.textContent = savedState?.isRunning ? "暫停" : "開始";
    startPauseButton.onclick = () => toggleStartPause(timeDisplay, startPauseButton);

    const resetButton = document.createElement("button");
    resetButton.textContent = "重置";
    resetButton.onclick = () => resetTimer(timerDiv, timeDisplay, startPauseButton);

    timerDiv.appendChild(titleDisplay);
    timerDiv.appendChild(timeDisplay);
    timerDiv.appendChild(startPauseButton);
    timerDiv.appendChild(resetButton);
    document.getElementById("timers-container").appendChild(timerDiv);

    // 更新選擇下拉框
    const option = document.createElement("option");
    option.value = `timer${index}`;
    option.textContent = titleDisplay.textContent; // 使用當前名稱
    document.getElementById("timer-selector").appendChild(option);

    // 如果計時器正在運行，重新啟動
    if (savedState?.isRunning) {
        startTimer(timeDisplay, startPauseButton);
    }
}
function toggleStartPause(display, button) {
    if (button.textContent === "開始") {
        button.textContent = "暫停";
        startTimer(display);
    } else {
        button.textContent = "開始";
        pauseTimer(display);
    }
}

function startTimer(display) {
    if (display.timerId) return;

    display.timerId = setInterval(() => {
        let time = parseInt(display.dataset.remainingTime, 10);
        time -= 1;
        display.dataset.remainingTime = time;

        if (time >= 0) {
            display.textContent = `倒數：${formatTime(time)}`;
        } else {
            display.textContent = `逾時：${formatTime(-time)}`;
            display.classList.add("overdue");
            display.closest(".timer").classList.add("overdue");
        }
    }, 1000);
}

function pauseTimer(display) {
    if (display.timerId) {
        clearInterval(display.timerId);
        delete display.timerId;
    }
}

function resetTimer(timerDiv, display, button) {
    pauseTimer(display);
    display.dataset.remainingTime = 600; // 單一重置為 10 分鐘
    display.textContent = `倒數：10:00`;
    display.classList.remove("overdue");
    timerDiv.classList.remove("overdue");
    button.textContent = "開始";
}

function resetAllTimers() {
    if (!confirm("確定要一鍵重製所有計時器嗎？")) return;

    const timers = document.querySelectorAll(".timer");
    timers.forEach(timer => {
        const timeDisplay = timer.querySelector("span");
        const button = timer.querySelector("button:first-of-type");
        pauseTimer(timeDisplay);
        timeDisplay.dataset.remainingTime = 1200; // 一鍵重製為 20 分鐘
        timeDisplay.textContent = `倒數：20:00`;
        timeDisplay.classList.remove("overdue");
        timer.classList.remove("overdue");
        button.textContent = "開始";
    });

    // 恢復一鍵開始按鈕
    const startAllButton = document.getElementById("start-all");
    startAllButton.disabled = false;
    startAllButton.style.backgroundColor = "";
    startAllButton.textContent = "一鍵開始";
}


function adjustTime() {
    const timerId = document.getElementById("timer-selector").value;
    const adjustment = parseInt(document.getElementById("add-time").value, 10);

    if (isNaN(adjustment)) {
        alert("請輸入有效的調整值！");
        return;
    }

    const timer = document.querySelector(`#${timerId} span`);
    if (timer) {
        let newTime = parseInt(timer.dataset.remainingTime, 10) + adjustment;
        timer.dataset.remainingTime = newTime;
        timer.textContent = newTime >= 0 ? `倒數：${formatTime(newTime)}` : `逾時：${formatTime(-newTime)}`;

        if (newTime < 0) {
            timer.classList.add("overdue");
            timer.closest(".timer").classList.add("overdue");
        } else {
            timer.classList.remove("overdue");
            timer.closest(".timer").classList.remove("overdue");
        }
    }
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function enterEditMode(titleDisplay) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = titleDisplay.textContent;
    input.addEventListener("blur", () => saveTitle(input, titleDisplay));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
    });

    titleDisplay.textContent = "";
    titleDisplay.appendChild(input);
    input.focus();
}

function saveTitle(input, titleDisplay) {
    const newTitle = input.value.trim() || titleDisplay.dataset.defaultTitle;
    titleDisplay.textContent = newTitle;

    const timerId = titleDisplay.closest(".timer").id;
    const option = document.querySelector(`#timer-selector option[value="${timerId}"]`);
    if (option) option.textContent = newTitle; // 同步更新下拉選單
}

function saveTimersState() {
    const timers = {};
    document.querySelectorAll(".timer").forEach(timer => {
        const id = timer.id;
        const title = timer.querySelector(".title").textContent;
        const timeDisplay = timer.querySelector("span");
        const remainingTime = parseInt(timeDisplay.dataset.remainingTime, 10);
        const isRunning = !!timeDisplay.timerId;

        timers[id] = { title, remainingTime, isRunning };
    });

    const startAllButton = document.getElementById("start-all");
    const state = {
        timers,
        isStartAllDisabled: startAllButton.disabled,
    };

    console.log("Saving state:", state); // 除錯訊息
    localStorage.setItem("timersState", JSON.stringify(state));
}
