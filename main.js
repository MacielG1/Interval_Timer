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
let startBtn = document.querySelector(".buttons .start");
let pauseBtn = document.querySelector(".buttons .stop");
let resetBtn = document.querySelector(".buttons .reset");
let saveWorkoutBtn = document.querySelector(".saveWorkoutBtn");
//settings
let settings = document.querySelector(".settings");
let settingsBtn = document.querySelector(".gear-button-container");
let toggles = document.querySelector(".toggles");
let toggleBackgroundColor = document.querySelector("#colorCheckbox");
let toggleSkipLastRest = document.querySelector("#skipLastRest");
// sidebar
let sidebar = document.querySelector(".sidebar");
let loadWorkoutBtn;
let deleteWorkoutBtn;
let workoutSavedContainer;

// check for settings on local storage
let isToggled = JSON.parse(localStorage.getItem("toggleBgColor")) || true;
let skipLastRest = JSON.parse(localStorage.getItem("skipLastRest") || true);
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
//
let WorkoutsSaved = JSON.parse(localStorage.getItem("workouts"));
if (WorkoutsSaved) {
  loadHTML();
}
function loadHTML() {
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

//

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
      prepareToWorkMode();
    }
    if (whichInterval == "work") {
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
      progressBar.value = sec;
    }

    if (whichInterval == "work" && time > workTime) {
      workToRestMode();
    }
    if (whichInterval == "rest" && time > restTime) {
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

let nextBtnClicked = false;

nextBtn.addEventListener("click", function () {
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
});

previousBtn.addEventListener("click", function () {
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
});

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
