let inputs = document.querySelectorAll(".options input");
//display data
let timeDisplay = document.querySelector(".display .timer");
let roundsDisplay = document.querySelector(".display .roundsDisplay");
let totalTimeDisplay = document.querySelector(".display .totalTimeDisplay");

// progress bar
let previousBtn = document.querySelector("#previousBtn");
let progressBar = document.querySelector("#progressBar");
let nextBtn = document.querySelector("#nextBtn");
// main container
let container = document.querySelector(".container");
// rounds input
let rounds = document.querySelector("#rounds");
// prepare inputs
let prepareMin = document.querySelector("#prepareMinutes");
let prepareSec = document.querySelector("#prepareSeconds");
// work inputs
let workMin = document.querySelector("#workMinutes");
let workSec = document.querySelector("#workSeconds");
let workColor = document.querySelector("#workColor");
// rest inputs
let restMin = document.querySelector("#restMinutes");
let restSec = document.querySelector("#restSeconds");
let restColor = document.querySelector("#restColor");
// timerInputs
let timeInput = document.querySelectorAll(".timeInput");
//buttons inputs
let startBtn = document.querySelector(".start");
let pauseBtn = document.querySelector(".stop");
let resetBtn = document.querySelector(".reset");
let restartBtn = document.querySelector(".restart");
let saveWorkoutBtn = document.querySelector(".saveWorkoutBtn");
//settings
let settings = document.querySelector(".settings");
let settingsBtn = document.querySelector(".gear-button-container");
let toggles = document.querySelector(".toggles");
let toggleBackgroundColor = document.querySelector("#colorCheckbox");
let toggleSkipLastRest = document.querySelector("#skipLastRest");
let toggleAutoRestart = document.querySelector("#autoPlaysOnRestart");
// sidebar
let sidebar = document.querySelector(".sidebar");
let loadWorkoutBtn;
let deleteWorkoutBtn;
let workoutSavedContainer;

// check for settings on local storage
let isToggled = JSON.parse(localStorage.getItem("toggleBgColor")) || true;
let skipLastRest = JSON.parse(localStorage.getItem("skipLastRest") || true);
let autoPlaysOnRestart = JSON.parse(localStorage.getItem("autoRestart") || true);
if (isToggled) {
  toggleBackgroundColor.checked = true;
} else {
  toggleBackgroundColor.checked = false;
}
if (skipLastRest) {
  toggleSkipLastRest.checked = true;
} else {
  toggleSkipLastRest.checked = false;
}
if (autoPlaysOnRestart) {
  toggleAutoRestart.checked = true;
} else {
  toggleAutoRestart.checked = false;
}
//
let WorkoutsSaved = JSON.parse(localStorage.getItem("workouts"));

document.querySelector("main").classList.add("main-noWorkouts");
if (WorkoutsSaved && WorkoutsSaved.length) {
  loadHTML();
}

function loadHTML() {
  document.querySelector("main").classList.add("main-hasWorkouts");
  WorkoutsSaved.forEach((workout, index) => {
    let backupWorkoutName = `Workout ${index + 1}`;
    let html = `
  <div class="workout" data-index=${index}>
  <button id="delete-btn" class="deleteBtn"></button>
  <p class="title">${workout.workoutName || backupWorkoutName}</p>

  

  <div class="data">
    <p>Rounds : ${workout.roundsDisplay}</p>
    <p><span class="colorSaved" style="background-color : ${workout.workColorDisplay}"></span>Work: ${workout.workDisplay}</p>
    <p>Prepare: ${workout.prepDisplay}</p>
    <p><span class="colorSaved" style="background-color : ${workout.restColorDisplay}"></span>Rest: ${workout.restDisplay}</p>
  </div>
  <div class="startWorkout">
    <button class="loadBtn">Load</button>
  </div>
  </div>
  `;
    sidebar.insertAdjacentHTML("beforeend", html);
  });
  workoutSavedContainer = document.querySelectorAll(".workout");
}

// deleteBtn Listener
sidebar.addEventListener("click", (e) => {
  if (e.target.matches(".deleteBtn")) {
    let index = e.target.parentElement.dataset.index;
    WorkoutsSaved.splice(index, 1);
    localStorage.setItem("workouts", JSON.stringify(WorkoutsSaved));
    // e.target.parentElement.classList.add("fade-out");
    e.target.parentElement.remove();

    // update index of remaining items in array
    workoutSavedContainer = document.querySelectorAll(".workout");
    if (!workoutSavedContainer.length) {
      document.querySelector("main").classList.remove("main-hasWorkouts");
      document.querySelector("main").classList.add("main-noWorkouts");
    }
    workoutSavedContainer.forEach((workout, i) => {
      workout.dataset.index = i;
    });
  } else if (e.target.matches(".loadBtn")) {
    let index = event.target.parentElement.parentElement.dataset.index;
    let workout = WorkoutsSaved[index];

    rounds.value = workout.roundsDisplay;
    prepareMin.value = workout.prepDisplay.split(":")[0];
    prepareSec.value = workout.prepDisplay.split(":")[1];
    workMin.value = workout.workDisplay.split(":")[0];
    workSec.value = workout.workDisplay.split(":")[1];
    restMin.value = workout.restDisplay.split(":")[0];
    restSec.value = workout.restDisplay.split(":")[1];

    workColor.value = workout.workColorDisplay;
    restColor.value = workout.restColorDisplay;
  }
});
// loadBtn Listener

class Timer {
  static interval;
  static expected;
  static timeout;
  static workFunc;
  static errorFunc;

  constructor(interval, workFunc, errorFunc) {
    this.interval = interval;
    this.expected = 0;
    this.timeout = null;
    this.stopped = false;
    this.workFunc = workFunc;
    this.errorFunc = errorFunc;
    this.start();
    this.step();
  }

  start() {
    this.expected = performance.now() + this.interval;
    this.timeout = setTimeout(this.step.bind(this), this.interval);
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timeout);
  }

  step() {
    let drift = performance.now() - this.expected;
    if (drift > this.interval) {
      console.log("Drift Higher");
      if (this.errorFunc) this.errorFunc();
    }
    if (!this.stopped) {
      this.workFunc();

      this.expected += this.interval;
      this.timeout = setTimeout(this.step.bind(this), Math.max(0, this.interval - drift));
    }
  }
}
timeInput.forEach((input) => {
  input.addEventListener("change", function () {
    if (this.value < 10) {
      this.value = Number(this.value).toString().padStart(2, "0");
    }
  });

  input.addEventListener("input", function (e) {
    if (this.value < 10 && !this.value.startsWith("0")) {
      this.value = Number(this.value).toString().padStart(2, "0");
    } else if (this.value.startsWith("0") && this.value.length > 1) {
      this.value = this.value.slice(1);
    }
  });

  //
  let inputCleared = false;
  input.addEventListener("keydown", function (e) {
    if (!inputCleared) {
      previousValue = this.value;
      this.value = "";
      inputCleared = true;
    }
  });
  input.addEventListener("blur", function (e) {
    inputCleared = false;
    if (this.value == "") {
      this.value = previousValue;
    }
    if (this.value < 10) {
      this.value = Number(this.value).toString().padStart(2, "0");
    }
    if (this.value >= 60 && e.target.classList.contains("secs")) {
      let selSec = convertSecondsToMinAndSec(this.value);
      let selMin = e.target.parentElement.querySelector(".mins").value;
      let [minute, second] = selSec.split(":");
      e.target.parentElement.classList.add("inputTransition");
      setTimeout(() => {
        e.target.parentElement.querySelector(".mins").value = `${Number(selMin) + Number(minute)}`;
        this.value = second;
      }, 250);
    }
  });
});
let maxValue = 1000000;
rounds.addEventListener("blur", (event) => {
  let value = event.target.value;

  // If the value is greater than the maximum allowed value, set the value to the maximum allowed value
  if (value > maxValue) {
    event.target.value = maxValue;
  }
});
//

let paused = true;
let intervalId;
let whichInterval;
let mins = 0;
let secs = 0;
let mili = 0;
let intervalWhenPaused;
let prepDisplay = `00:05`;
let workDisplay = `00:10`;
let restDisplay = `00:10`;
let prepTimeinSec;
let workTimeinSec;
let restTimeinSec;
let totalWorkoutTime;
//Event Listeners
startBtn.addEventListener("click", (e) => {
  e.preventDefault();

  roundsDisplay.textContent = `${currentRound}/${rounds.value}`;

  whichInterval = intervalWhenPaused || "prepare";
  prepDisplay = `${prepareMin.value}:${prepareSec.value}`;
  workDisplay = `${workMin.value}:${workSec.value}`;
  restDisplay = `${restMin.value}:${restSec.value}`;
  prepTimeinSec = convertHour_Min_Sec_toSec(prepDisplay);
  workTimeinSec = convertHour_Min_Sec_toSec(workDisplay);

  restTimeinSec = convertHour_Min_Sec_toSec(restDisplay);
  if (skipLastRest) {
    totalWorkoutTime = pad(convertSecondsToMinAndSec(workTimeinSec * rounds.value + restTimeinSec * (rounds.value - 1)));
  } else {
    totalWorkoutTime = pad(convertSecondsToMinAndSec(workTimeinSec * rounds.value + restTimeinSec * rounds.value));
  }

  if (paused) {
    startBtn.textContent = "Start";
    paused = false;

    intervalId = new Timer(1000, () => {
      updateTime(workDisplay, restDisplay, prepDisplay, prepTimeinSec, workTimeinSec, restTimeinSec);
    });
  }
});
pauseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  intervalWhenPaused = whichInterval;
  startBtn.textContent = "Resume";

  if (!paused) {
    paused = true;
    intervalId.stop();
  }
});
resetBtn.addEventListener("click", () => {
  resetTimer();
  resetWhenToggled();
});
restartBtn.addEventListener("click", (e) => {
  e.preventDefault();

  resetTimer();
  resetWhenToggled();
  if (autoPlaysOnRestart) {
    startBtn.click();
  }
});

let workoutsArr = [];
saveWorkoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  workoutsArr = JSON.parse(localStorage.getItem("workouts")) || [];
  let currentWorkout = {
    roundsDisplay: rounds.value,
    prepDisplay: `${prepareMin.value}:${prepareSec.value}`,
    workDisplay: `${workMin.value}:${workSec.value}`,
    restDisplay: `${restMin.value}:${restSec.value}`,
    workColorDisplay: workColor.value,
    restColorDisplay: restColor.value,
    workoutName: e.target.parentElement.querySelector(".workoutName").value,
  };

  workoutsArr.push(currentWorkout);
  localStorage.setItem("workouts", JSON.stringify(workoutsArr));

  WorkoutsSaved = JSON.parse(localStorage.getItem("workouts"));

  sidebar.innerHTML = "";
  loadHTML();
  //resets name workout name
  e.target.parentElement.querySelector(".workoutName").value = "";
});

const mediaQuery = window.matchMedia("(max-width: 1000px)");
settingsBtn.addEventListener("click", (e) => {
  toggles.classList.toggle("toggle-on");
  if (mediaQuery.matches) {
    if (document.querySelector("main").classList.contains("move-down")) {
      document.querySelector("main").classList.remove("move-down");
      document.querySelector("main").classList.add("move-up");
    } else {
      document.querySelector("main").classList.remove("move-up");
      document.querySelector("main").classList.add("move-down");
    }
  }
});

//

toggleBackgroundColor.addEventListener("change", (e) => {
  if (!e.target.checked) {
    isToggled = false;
    localStorage.setItem("toggleBgColor", isToggled);
  } else {
    isToggled = true;
    localStorage.setItem("toggleBgColor", isToggled);
  }
});

toggleSkipLastRest.addEventListener("change", (e) => {
  if (!e.target.checked) {
    skipLastRest = false;
    localStorage.setItem("skipLastRest", skipLastRest);
  } else {
    skipLastRest = true;
    localStorage.setItem("skipLastRest", skipLastRest);
  }
});
toggleAutoRestart.addEventListener("change", (e) => {
  if (!e.target.checked) {
    autoRestart = false;
    localStorage.setItem("autoRestart", autoRestart);
  } else {
    autoRestart = true;
    localStorage.setItem("autoRestart", autoRestart);
  }
});

//
let favicon = `<svg id="mySVG" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="45" fill="#fff" stroke="#000" stroke-width="5"/>
<line x1="50" y1="50" x2="50" y2="18" stroke="#000" stroke-width="5"/>
<line x1="50" y1="50" x2="75" y2="36" stroke="#000" stroke-width="5"/>
</svg>`;
function changeFavicon(faviconSVG, fillColor) {
  let updatedSVG = faviconSVG.replace('fill="#fff"', `fill="${fillColor}"`);
  let url = "data:image/svg+xml," + encodeURIComponent(updatedSVG);
  let link = document.querySelector("link[rel*='icon']") || document.createElement("link");
  link.type = "image/svg+xml";
  link.rel = "shortcut icon";
  link.href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
}

let sec = "0" + 0;
let min = "0" + 0;
let time = `00:00`;
let currentRound = 1;
let currentTime = "00:00";
let counter = 0;
let workTimeUsed;
let restTimeUsed;

function updateTime(workTime, restTime, prepTime, prepTimeinSec, workTimeinSec, restTimeinSec) {
  workTimeUsed = workTime = pad(workTime);
  restTimeUsed = restTime = pad(restTime);
  prepTime = pad(prepTime);
  if (currentRound <= rounds.value) {
    sec++;
    sec = sec < 10 ? "0" + sec : sec;

    if (sec == 60) {
      min++;
      min = min < 10 ? "0" + min : min;
      sec = "0" + 0;
    }
    time = `${min}:${sec}`;

    //next
    // if (nextBtnClicked) {
    //   sec = "0" + 0;
    //   nextBtnClicked = false;
    // }
    // previous
    //
    if (whichInterval == "prepare") {
      changeFavicon(favicon, `#124197`);
      document.title = `Prep: ${time}`;
      progressBar.style.setProperty("--progressBar-color", `#21365c`);
      progressBar.max = prepTimeinSec;
      progressBar.value = sec;
      if (workoutSavedContainer) {
        workoutSavedContainer.forEach((workout) => {
          if (isToggled) {
            workout.style.border = "2px solid var(--title-color)";
          }
        });
      }
    }

    if (whichInterval == "prepare" && time > prepTime) {
      document.title = `Work: 00:00`;
      changeFavicon(favicon, workColor.value);
      prepareToWorkMode();
    }
    if (whichInterval == "work") {
      document.title = `Work: ${time}`;
      progressBar.value = sec;
      container.style.borderWidth = "0.4em";
      if (workoutSavedContainer) {
        workoutSavedContainer.forEach((workout) => {
          if (isToggled) {
            workout.style.border = "none";
          }
        });
      }
    }
    if (whichInterval == "rest") {
      document.title = `Rest: ${time}`;
      progressBar.value = sec;
    }

    if (whichInterval == "work" && time > workTime) {
      document.title = `Rest: 00:00`;
      changeFavicon(favicon, restColor.value);
      workToRestMode();
    }
    if (whichInterval == "rest" && time > restTime) {
      document.title = `Work: 00:00`;
      changeFavicon(favicon, workColor.value);
      restToWorkMode();
    }

    if (time !== `00:00` && (whichInterval == "work" || whichInterval == "rest") && currentRound <= rounds.value) {
      counter++;
      currentTime = convertSecondsToMinAndSec(counter);
      totalTimeDisplay.textContent = `${currentTime}/${totalWorkoutTime}`;
    }

    timeDisplay.textContent = `${min}:${sec}`;
  } else {
    resetTimer();
    resetWhenToggled();
  }
}

nextBtn.addEventListener("click", nextIntervalMode);

previousBtn.addEventListener("click", previousIntervalMode);

function previousIntervalMode() {
  if (!paused) {
    if (whichInterval === "prepare") {
      sec = "0" + 0;
      timeDisplay.textContent = "00:00";
    }
    if (whichInterval === "work" && currentRound == 1) {
      whichInterval = "prepare";
      document.body.style.backgroundColor = "black";
      sec = "0" + 0;
      min = "0" + 0;
      time = `00:00`;
      mins = 0;
      secs = 0;
      currentRound = 1;
      roundsDisplay.textContent = `0/0`;
      timeDisplay.textContent = "00:00";
      container.style.borderWidth = "0.2em";
      container.style.borderColor = "rgb(216, 216, 216)";
      counter = 0;
      currentTime = convertSecondsToMinAndSec(counter);
      totalTimeDisplay.textContent = `${currentTime}/${totalWorkoutTime}`;
      progressBar.style.setProperty("--progressBar-color", `#21365c`);
      if (workoutSavedContainer) {
        workoutSavedContainer.forEach((workout) => {
          if (isToggled) {
            workout.style.border = "2px solid var(--title-color)";
          }
        });
      }
    }
    if (currentRound > 1 || (whichInterval === "rest" && currentRound == 1)) {
      if (whichInterval === "work") {
        currentRound--;
        roundsDisplay.textContent = `${currentRound}/${rounds.value}`;
        workToRestMode();

        counter = convertHour_Min_Sec_toSec(workTimeUsed) * (currentRound - 1) + convertHour_Min_Sec_toSec(restTimeUsed) * currentRound;
        currentTime = convertSecondsToMinAndSec(counter);
        totalTimeDisplay.textContent = `${currentTime}/${totalWorkoutTime}`;
      } else if (whichInterval === "rest") {
        currentRound--;
        restToWorkMode();
        counter = convertHour_Min_Sec_toSec(workTimeUsed) * (currentRound - 1) + convertHour_Min_Sec_toSec(restTimeUsed) * (currentRound - 1);

        currentTime = convertSecondsToMinAndSec(counter);
        totalTimeDisplay.textContent = `${currentTime}/${totalWorkoutTime}`;
      } else if (whichInterval === "prepare") {
        sec = "0" + 0;
        currentRound--;
        timeDisplay.textContent = "00:00";
      }
    }
  }
}
document.addEventListener("keyup", function (event) {
  if (document.activeElement.tagName === "INPUT") return;
  if (event.code === "ArrowRight") {
    nextIntervalMode();
  }
});
document.addEventListener("keyup", function (event) {
  if (document.activeElement.tagName === "INPUT") return;
  if (event.code === "ArrowLeft") {
    previousIntervalMode();
  }
});
let isSpaceClicked = true;

document.addEventListener("keyup", function (event) {
  if (document.activeElement.tagName === "INPUT") return;
  if (event.code === "Space") {
    if (isSpaceClicked) {
      startBtn.click();
    } else {
      pauseBtn.click();
    }
    isSpaceClicked = !isSpaceClicked;
  }
});

document.addEventListener("keyup", function (event) {
  event.preventDefault();
  if (document.activeElement.tagName === "INPUT") return;
  if (event.code === "KeyR") {
    restartBtn.click();
  }
});
document.addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.code === "Backspace") {
    resetBtn.click();
  }
});

let nextBtnClicked = false;
function nextIntervalMode() {
  nextBtnClicked = true;
  if (!paused) {
    if (currentRound <= rounds.value) {
      if (whichInterval === "work") {
        counter = convertHour_Min_Sec_toSec(workTimeUsed) * currentRound + convertHour_Min_Sec_toSec(restTimeUsed) * (currentRound - 1);

        workToRestMode();
      } else if (whichInterval === "rest") {
        counter = convertHour_Min_Sec_toSec(restTimeUsed) * currentRound + convertHour_Min_Sec_toSec(workTimeUsed) * currentRound;
        restToWorkMode();
      } else if (whichInterval === "prepare") {
        prepareToWorkMode();
      }
    } else {
      resetTimer();
    }
  }
}
function prepareToWorkMode() {
  whichInterval = "work";
  toggledBackgroundColor("work");
  if (!isToggled) {
    container.style.borderColor = `${workColor.value}`;
  } else {
    container.style.borderColor = "black";
  }

  sec = "0" + 0;
  min = "0" + 0;
  time = `00:00`;

  progressBar.max = workTimeinSec;
  progressBar.value = sec;
  progressBar.style.setProperty("--progressBar-color", `${workColor.value}`);
}
function workToRestMode() {
  whichInterval = "rest";
  timeDisplay.textContent = `00:00`;
  toggledBackgroundColor("rest");
  if (!isToggled) {
    container.style.borderColor = `${restColor.value}`;
  } else {
    container.style.borderColor = "black";
  }

  sec = "0" + 0;
  min = "0" + 0;
  time = `00:00`;
  progressBar.max = restTimeinSec;
  progressBar.value = sec;
  progressBar.style.setProperty("--progressBar-color", `${restColor.value}`);
  if (currentRound + 1 > rounds.value) {
    if (skipLastRest) {
      resetTimer();
      resetWhenToggled();

      timeDisplay.textContent = "End!";
    }
  }
}

function restToWorkMode() {
  currentRound++;
  timeDisplay.textContent = `00:00`;
  roundsDisplay.textContent = `${currentRound}/${rounds.value}`;
  toggledBackgroundColor("work");
  whichInterval = "work";
  if (!isToggled) {
    container.style.borderColor = `${workColor.value}`;
  } else {
    container.style.borderColor = "black";
  }
  sec = "0" + 0;
  min = "0" + 0;
  time = `00:00`;
  progressBar.max = workTimeinSec;
  progressBar.style.setProperty("--progressBar-color", `${workColor.value}`);

  if (currentRound > rounds.value) {
    progressBar.value = 0;
    container.style.borderColor = "rgb(216, 216, 216)";
    roundsDisplay.textContent = `0/0`;
    if (isToggled) {
      document.body.style.backgroundColor = "black";
      workout.style.border = "none";
    }
    container.style.borderWidth = "0.2em";
    sec = "0" + 0;
    min = "0" + 0;
    time = `00:00`;
  } else {
    progressBar.value = sec;
  }
}

function pad(time) {
  if (time.includes(":")) {
    // Time string is in the format "MM:SS"
    const [minutes, seconds] = time.split(":");
    return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  } else {
    // Time string is in the format "SS"
    return `00:${time.padStart(2, "0")}`;
  }
}

function convertHour_Min_Sec_toSec(str) {
  let [minute, second] = str.split(":");

  minute = parseInt(minute, 10);
  second = parseInt(second, 10);
  let totalSeconds = minute * 60 + second;
  return totalSeconds;
}

function convertSecondsToMinAndSec(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function toggledBackgroundColor(mode) {
  if (isToggled) {
    if (mode === "work") {
      document.body.style.backgroundColor = workColor.value;
    } else if (mode === "rest") {
      document.body.style.backgroundColor = restColor.value;
    }
  } else {
    document.body.style.backgroundColor = "black";
  }
}

function resetTimer() {
  if (!paused) {
    intervalId.stop();
    paused = true;
  }
  changeFavicon(favicon, `#124197`);
  document.title = `Timer`;
  document.body.style.backgroundColor = "black";
  sec = "0" + 0;
  min = "0" + 0;
  time = `00:00`;
  mins = 0;
  secs = 0;
  currentRound = 1;
  roundsDisplay.textContent = `0/0`;
  intervalWhenPaused = "prepare";
  currentTime = "00:00";
  timeDisplay.textContent = "00:00";
  container.style.borderWidth = "0.2em";
  container.style.borderColor = "rgb(216, 216, 216)";
  startBtn.textContent = "Start";
  progressBar.value = 0;
  totalTimeDisplay.textContent = "00:00/00:00";
  counter = 0;
}
function resetWhenToggled() {
  if (isToggled) {
    document.body.style.backgroundColor = "black";
    if (sidebar.children.length > 0) {
      if (workoutSavedContainer) {
        workoutSavedContainer.forEach((workout) => {
          workout.style.border = "2px solid var(--title-color)";
        });
      }
    }
  }
}
