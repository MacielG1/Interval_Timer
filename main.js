let inputs = document.querySelectorAll(".options input");
//display data
let timeDisplay = document.querySelector(".display .timer");
let roundsDisplay = document.querySelector(".display .roundsDisplay");
let totalTimeDisplay = document.querySelector(".display .totalTimeDisplay");
// progress bar
let progressBar = document.querySelector("#progressBar");
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
  showSavedWorkouts();
}
function showSavedWorkouts(transition) {
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
    <button>Load</button>
  </div>
  </div>
  `;
    sidebar.insertAdjacentHTML("beforeend", html);
  });
  deleteWorkoutBtn = document.querySelectorAll(".sidebar .deleteBtn");
  deleteWorkoutBtn.forEach((deleletbtn) => {
    deleletbtn.addEventListener("click", (event) => {
      let index = event.target.parentElement.dataset.index;
      WorkoutsSaved.splice(index, 1);
      localStorage.setItem("workouts", JSON.stringify(WorkoutsSaved));
      event.target.parentElement.classList.add("fade-out");
      setTimeout(() => {
        event.target.parentElement.remove();
      }, 300); // change also the css transition using fade-out
    });
  });
  loadWorkoutBtn = document.querySelectorAll(".sidebar .startWorkout");
  loadWorkoutBtn.forEach((startbtn) => {
    startbtn.addEventListener("click", (event) => {
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
    });
  });
  workoutSavedContainer = document.querySelectorAll(".workout");
}
//
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
  // let previousValue = "";
  // input.addEventListener("focus", function (e) {
  //   previousValue = e.target.value;
  //   e.target.value = "";
  // });

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
  // Get the current value of the input element
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
  totalWorkoutTime = pad(convertSecondsToMinAndSec(workTimeinSec * rounds.value + restTimeinSec * rounds.value));
  totalTimeDisplay.textContent = `Total: ${totalWorkoutTime}`;

  if (paused) {
    startBtn.textContent = "Start";
    paused = false;
    // updateTime(workDisplay, restDisplay, prepDisplay, prepTimeinSec, workTimeinSec, restTimeinSec);
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
  showSavedWorkouts(true);
  e.target.parentElement.querySelector(".workoutName").value = "";
});
const toggles = document.querySelector(".toggles");
const mediaQuery = window.matchMedia("(max-width: 1000px)");
settingsBtn.addEventListener("click", (e) => {
  // e.target.parentElement.querySelector(".toggles").classList.toggle("toggle-on");
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

function updateTime(workTime, restTime, prepTime, prepTimeinSec, workTimeinSec, restTimeinSec) {
  if (currentRound <= rounds.value) {
    sec++;

    sec = sec < 10 ? "0" + sec : sec;

    if (sec == 60) {
      min++;
      min = min < 10 ? "0" + min : min;
      sec = "0" + 0;
    }
    time = `${min}:${sec}`;

    if (whichInterval == "prepare") {
      progressBar.style.setProperty("--progressBar-color", `#21365c`);
      progressBar.max = prepTimeinSec;
      progressBar.value = sec;
    }

    if (whichInterval == "prepare" && time > prepTime) {
      whichInterval = "work";
      toggledBackgroundColor("work");
      container.style.borderColor = `${workColor.value}`;
      sec = "0" + 1;
      min = "0" + 0;
      time = `00:01`;

      progressBar.max = workTimeinSec;
      progressBar.value = sec;
      progressBar.style.setProperty("--progressBar-color", `${workColor.value}`);
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
      whichInterval = "rest";
      toggledBackgroundColor("rest");
      container.style.borderColor = `${restColor.value}`;
      sec = "0" + 1;
      min = "0" + 0;
      time = `00:01`;
      progressBar.max = restTimeinSec;
      progressBar.value = sec;
      progressBar.style.setProperty("--progressBar-color", `${restColor.value}`);
      if (currentRound + 1 > rounds.value) {
        if (skipLastRest) {
          resetTimer();
          resetWhenToggled();
        }
      }
    }
    if (whichInterval == "rest" && time > restTime) {
      currentRound++;
      roundsDisplay.textContent = `${currentRound}/${rounds.value}`;
      toggledBackgroundColor("work");
      whichInterval = "work";
      container.style.borderColor = `${workColor.value}`;
      sec = "0" + 1;
      min = "0" + 0;
      time = `00:01`;
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
    timeDisplay.textContent = `${min}:${sec}`;
  } else {
    resetTimer();
    resetWhenToggled();
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
  // let arr = str.split(":");
  // let seconds = Number(arr[0] * 60 + +arr[1]);
  let [minute, second] = str.split(":");

  minute = parseInt(minute, 10);
  second = parseInt(second, 10);
  let totalSeconds = minute * 60 + second;
  return totalSeconds;
  // return seconds;
}

function convertSecondsToMinAndSec(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  timeDisplay.textContent = "00:00";
  container.style.borderWidth = "0.2em";
  container.style.borderColor = "rgb(216, 216, 216)";
  startBtn.textContent = "Start";
  progressBar.value = 0;
  totalTimeDisplay.textContent = "Total: 00:00";
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
