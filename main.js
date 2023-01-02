let inputs = document.querySelectorAll(".options input");
//display data
let mainTimeDisplay = document.querySelector(".display .timer");
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
let startBtn = document.querySelector(".buttons .start");
let stopBtn = document.querySelector(".buttons .stop");
let resetBtn = document.querySelector(".buttons .reset");
let saveWorkoutBtn = document.querySelector(".saveWorkoutBtn");
// sidebar Buttons
let startWorkoutBtn = document.querySelector(".workout .startWorkout");
let deleteWorkoutBtn = document.querySelector(".workout .deleteBtn");
//

let counter = 0;
let currentMode;
let currentRound = 0;
let counter2 = 5;
let interval;
let initialInt;
let intervalId;
let prepInterval;
let currentSet;
let isRunning = false;
let whichMode;
let currentInterval;

timeInput.forEach((input) => {
  input.value = input.value || "00";
});
// (timeWhenStoped,modeWhenStoped,roundWhenStoped);
function createTimer(mode = "prepare", currRound = 1, time) {
  let workTimeCurrent = [workMin.value, workSec.value];
  let restTimeCurrent = [restMin.value, restSec.value];
  let prepTimeCurrent = [prepareMin.value, prepareSec.value];

  let workDisplay = (mainTimeDisplay.textContent = `${workTimeCurrent[0]}:${workTimeCurrent[1]}`);
  let restDisplay = (mainTimeDisplay.textContent = `${restTimeCurrent[0]}:${restTimeCurrent[1]}`);
  let prepDisplay = (mainTimeDisplay.textContent = `${prepTimeCurrent[0]}:${prepTimeCurrent[1]}`);

  let workSecAmount = convertHour_Min_Sec_toSec(workDisplay) + 1;
  let restSecAmount = convertHour_Min_Sec_toSec(restDisplay) + 1;
  let prepSecAmount = convertHour_Min_Sec_toSec(prepDisplay);
  let round;
  let sets = rounds.value;
  let workTime = workSecAmount;
  let restTime = restSecAmount;
  isRunning = false;
  currentSet = currRound;
  whichMode = mode;
  initialInt = new Timer(0, function () {
    isRunning = true;
    round = 0;
    // mainTimeDisplay.textContent = secondsToMMSS(prepSecAmount);
    initialInt.stop();
    prepInterval = new Timer(1000, function () {
      currentInterval = prepInterval;
      if (whichMode == "prepare") {
        prepSecAmount--;
        mainTimeDisplay.textContent = secondsToMMSS(prepSecAmount);
      }
      if (prepSecAmount == 0) {
        prepInterval.stop();
        whichMode = "work";
        intervalId = new Timer(1000, function () {
          currentInterval = intervalId;
          if (whichMode == "work") {
            workTime--;
            document.body.style.backgroundColor = workColor.value;
            progressBar.value = workTime;
            progressBar.max = workSecAmount - 1;
            progressBar.style.setProperty("--progressBar-color", `${workColor.value}`);
            mainTimeDisplay.textContent = secondsToMMSS(workTime);
          }
          if (workTime < 0) {
            whichMode = "rest";
          }
          if (whichMode == "rest") {
            restTime--;
            document.body.style.backgroundColor = restColor.value;
            progressBar.value = restTime;
            progressBar.max = restSecAmount - 1;
            progressBar.style.setProperty("--progressBar-color", `${restColor.value}`);
            mainTimeDisplay.textContent = secondsToMMSS(restTime);
          }

          if (restTime == 0) {
            whichMode = "work";
            currentSet++;
            roundsDisplay.textContent = `${currentSet - 1}/${rounds.value}`;
            workTime = workSecAmount;
            restTime = restSecAmount;
          }

          if (currentSet > sets) {
            document.body.style.backgroundColor = "black";
            intervalId.stop();
          }
        });
      }
    });
  });
}
// button listeners
startBtn.addEventListener("click", function (e) {
  e.preventDefault();
  roundsDisplay.textContent = `${currentRound}/${rounds.value}`;
  createTimer();
});
let stopCounter = 0;
let timeWhenStoped;
let modeWhenStoped;
let roundWhenStoped;

stopBtn.addEventListener("click", function (e) {
  e.preventDefault();
  timeWhenStoped = convertHour_Min_Sec_toSec(mainTimeDisplay.textContent);

  modeWhenStoped = whichMode;
  roundWhenStoped = currentSet;
  currentInterval.stop();
  isRunning = false;
});
stopBtn.addEventListener("keydown", function (e) {
  e.preventDefault();
  createTimer(modeWhenStoped, roundWhenStoped, timeWhenStoped);
});

saveWorkoutBtn.addEventListener("click", function (e) {
  e.preventDefault();
});
resetBtn.addEventListener("click", function () {
  prepInterval.stop();
  intervalId.stop();
  mainTimeDisplay.textContent = "00:00";
  roundsDisplay.textContent = "0/0";
  document.body.style.backgroundColor = "black";
  progressBar.style.setProperty("--progressBar-color", `#999999`);
});

timeInput.forEach((input) => {
  input.addEventListener("change", function () {
    if (this.value < 10) {
      console.log(this.value);
      this.value = Number(this.value).toString().padStart(2, "0");
    }
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
      console.log(this.value);
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

function convertHour_Min_Sec_toSec(str) {
  let arr = str.split(":");
  let seconds = Number(arr[0] * 60 + +arr[1]);

  return seconds;
}
function secondsToMMSS(sec) {
  const min = Math.floor(sec / 60);
  const formattedMinutes = min < 10 ? `0${min}` : min;
  const formattedSeconds = sec % 60 < 10 ? `0${sec % 60}` : sec % 60;
  return `${formattedMinutes}:${formattedSeconds}`;
}

// class Timer {
//   static interval;
//   static expected;
//   static timeout;
//   static workFunc;
//   static errorFunc;

//   constructor(interval, workFunc, errorFunc) {
//     this.interval = interval;
//     this.expected = 0;
//     this.timeout = null;
//     this.stopped = false;
//     this.workFunc = workFunc;
//     this.errorFunc = errorFunc;
//     this.start();
//   }

//   start() {
//     this.expected = Date.now() + this.interval;
//     this.timeout = setTimeout(this.step.bind(this), this.interval);
//   }

//   stop() {
//     this.stopped = true;

//     clearTimeout(this.timeout);
//   }

//   step() {
//     let drift = Date.now() - this.expected;
//     if (drift > this.interval) {
//       console.log("Drift Higher");
//       if (this.errorFunc) this.errorFunc();
//     }
//     if (!this.stopped) {
//       this.workFunc();
//       console.log(drift, this.expected, Math.max(0, this.interval - drift));
//       this.expected += this.interval;
//       this.timeout = setTimeout(this.step.bind(this), Math.max(0, this.interval - drift));
//     }
//   }
// }

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
