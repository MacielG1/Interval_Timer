let inputs = document.querySelectorAll(".options input");
//display data
let timeDisplay = document.querySelector(".display .timer");
let roundsDisplay = document.querySelector(".display .roundsDisplay");
// progress bar
let progressBar = document.querySelector("#progressBar");

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

const startBtn = document.querySelector(".buttons .start");
const pauseBtn = document.querySelector(".buttons .stop");
const resetBtn = document.querySelector(".buttons .reset");

let saveWorkoutBtn = document.querySelector(".saveWorkoutBtn");
// sidebar
let sidebar = document.querySelector(".sidebar");
let startWorkoutBtn;
let deleteWorkoutBtn;
//

let WorkoutsSaved = JSON.parse(localStorage.getItem("workouts"));

if (WorkoutsSaved) {
  showSavedWorkouts();
}
function showSavedWorkouts() {
  WorkoutsSaved.forEach((workout, index) => {
    let html = `
  <div class="workout" data-index=${index}>
  <button id="delete-btn" class="deleteBtn"></button>
  <p class="title">Workout 1</p>

  <div class="data">
    <p>Rounds : ${workout.roundsDisplay}</p>
    <p>Work: ${workout.workDisplay}</p>
    <p>Prepare: ${workout.prepDisplay}</p>
    <p>Rest: ${workout.restDisplay}</p>
  </div>
  <div class="startWorkout">
    <button>Start</button>
  </div>
  </div>
  `;
    sidebar.insertAdjacentHTML("afterbegin", html);
  });
  deleteWorkoutBtn = document.querySelectorAll(".sidebar .deleteBtn");
  deleteWorkoutBtn.forEach((deleletbtn) => {
    deleletbtn.addEventListener("click", (event) => {
      let index = event.target.parentElement.dataset.index;
      WorkoutsSaved.splice(index, 1);
      localStorage.setItem("workouts", JSON.stringify(WorkoutsSaved));
      event.target.parentElement.remove();
    });
  });
  startWorkoutBtn = document.querySelectorAll(".sidebar .startWorkout");
  startWorkoutBtn.forEach((startbtn) => {
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
    });
  });
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
    console.log(this.value);
  });

  let previousValue = "";
  input.addEventListener("focus", function () {
    previousValue = this.value;
    this.value = "";
  });

  input.addEventListener("blur", function (e) {
    if (this.value === "") {
      this.value = previousValue;
    }
    if (this.value < 10) {
      this.value = Number(this.value).toString().padStart(2, "0");
    }
    // if (e.target.value >= 10 && e.target.value <= 60) {
    //   e.target.value = Number(e.target.value);
    // }
    // if (e.target.value.length > 2) {
    //   e.target.value = e.target.value.slice(0, 2);
    // }
  });
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
  paused = true;
  intervalId.stop();

  mins = 0;
  secs = 0;
  timeDisplay.textContent = "00:00";
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
  };

  workoutsArr.push(currentWorkout);

  // Save the updated array to local storage
  localStorage.setItem("workouts", JSON.stringify(workoutsArr));

  WorkoutsSaved = JSON.parse(localStorage.getItem("workouts"));

  sidebar.innerHTML = "";
  showSavedWorkouts();
});

//

let sec = "0" + 0;
let min = "0" + 0;
let time = `00:00`;
let currentRound = 0;
function updateTime(workTime, restTime, prepTime, prepTimeinSec, workTimeinSec, restTimeinSec) {
  if (currentRound < rounds.value) {
    if (whichInterval == "prepare") {
      progressBar.value = sec;
      progressBar.max = prepTimeinSec;
      progressBar.style.setProperty("--progressBar-color", `#21365c`);
    }
    if (whichInterval == "prepare" && time > prepTime) {
      whichInterval = "work";
      sec = "0" + 0;
      min = "0" + 0;
      time = `00:00`;
      progressBar.value = sec;
    }
    if (whichInterval == "work") {
      progressBar.value = sec;
      progressBar.max = workTimeinSec;
      progressBar.style.setProperty("--progressBar-color", `${workColor.value}`);
    }
    if (whichInterval == "rest") {
      progressBar.value = sec;
      progressBar.max = restTimeinSec;
      progressBar.style.setProperty("--progressBar-color", `${restColor.value}`);
    }
    if (whichInterval == "work" && time > workTime) {
      whichInterval = "rest";
      sec = "0" + 0;
      min = "0" + 0;
      time = `00:00`;
      progressBar.value = sec;
    } else if (whichInterval == "rest" && time > restTime) {
      currentRound++;
      roundsDisplay.textContent = `${currentRound}/${rounds.value}`;
      whichInterval = "work";
      sec = "0" + 0;
      min = "0" + 0;
      time = `00:00`;
      progressBar.value = sec;
    }
    timeDisplay.textContent = `${min}:${sec}`;
    sec++;
    sec = sec < 10 ? "0" + sec : sec;

    if (sec == 60) {
      min++;
      min = min < 10 ? "0" + min : min;
      sec = "0" + 0;
    }
    time = `${min}:${sec}`;
  } else {
    timeDisplay.textContent = `00:00`;

    intervalId.stop();
  }
}
function pad(unit) {
  return ("0" + unit).length > 2 ? unit : "0" + unit;
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
