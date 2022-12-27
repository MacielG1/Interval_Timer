let inputs = document.querySelectorAll(".options input");
//display data
let mainTimeDisplay = document.querySelector(".display .timer");
let roundsDisplay = document.querySelector(".display .roundsDisplay");
// rounds and prepare inputs
let rounds = document.querySelector("#rounds");
let prepare = document.querySelector("#prepare");
// work inputs
let workMin = document.querySelector("#workMinutes");
let workSec = document.querySelector("#workSeconds");
let workColor = document.querySelector("#workColor");
// rest inputs
let restMin = document.querySelector("#restMinutes");
let restSec = document.querySelector("#restSeconds");
let restColor = document.querySelector("#restColor");
//buttons inputs
let startBtn = document.querySelector(".buttons .start");
let stopBtn = document.querySelector(".buttons .stop");
let resetBtn = document.querySelector(".buttons .reset");
let saveWorkoutBtn = document.querySelector(".buttons .saveWorkoutBtn");
// sidebar Buttons
let startWorkoutBtn = document.querySelector(".workout .startWorkout");
let deleteWorkoutBtn = document.querySelector(".workout .deleteBtn");

startBtn.addEventListener("click", function (e) {
  e.preventDefault();
});
stopBtn.addEventListener("click", function (e) {
  e.preventDefault();
});
saveWorkoutBtn.addEventListener("click", function (e) {
  e.preventDefault();
});
resetBtn.addEventListener("click", function () {
  mainTimeDisplay.textContent = "00:00";
  roundsDisplay.textContent = "0/0";
});
