const divScheduleCreate = document.querySelector(".schedule-create");
const scheduleCreateTextAreaSchedule = document.querySelector("#schedule-create-input");
const scheduleCreatebuttonCreateSchedule = document.querySelector("#schedule-create-button-create-timer");

let exercises = [];

scheduleCreatebuttonCreateSchedule.addEventListener("click", function() {
  try {
    const schedule = scheduleCreateTextAreaSchedule.value;
    if (schedule.length == 0) throw "No schedule input.";

    // Parsing schedule
    const split_schedule = schedule.split("\n");

    for (let i = 0; i < split_schedule.length; i++) {
      const exerciseDescription = split_schedule[i].trim();
      if (exerciseDescription.length == 0) continue;
      const splitExerciseDescription = exerciseDescription.split(" ");

      let exerciseNameWords = [];
      let setTimes = [];

      let foundTime = false;
      for (let j = 0; j < splitExerciseDescription.length; j++) {
        const currentWord = splitExerciseDescription[j];
        const isTime = checkIfTime(currentWord);
        if (isTime) {
          foundTime = true;
          setTimes.push(minSecondsToSeconds(currentWord));
        } else {
          if (foundTime) throw `Can't add word ${currentWord} after inserting time`;
          exerciseNameWords.push(currentWord);
        }
      }
      exercises.push({
        name: exerciseNameWords.join(" "),
        sets: setTimes
      });
    }

    divScheduleCreate.classList.add("hidden");
    createTimer(exercises);
  } catch (err) {
    alert(`Invalid Schedule: ${err}`);
    console.trace(err);
  }
});

function checkIfTime(word) {
  const timePattern = /^[1-9]?\d:\d\d$/;
  return timePattern.test(word);
}

function minSecondsToSeconds(time) {
  const splitTime = time.split(":");
  const minutes = parseInt(splitTime[0]);
  const seconds = parseInt(splitTime[1]);
  if (seconds >= 60) throw "Seconds must be between 0 and 59";
  return minutes * 60 + seconds;
}

function secondsToMinSeconds(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? "0" + seconds.toString(10) : seconds}`;
}

const divTimer = document.querySelector(".timer");
const timerButtonPreviousPeriod = document.querySelector("#timer-button-previous-period");
const timerButtonNextPeriod = document.querySelector("#timer-button-next-period");
const timerButtonAdd10 = document.querySelector("#timer-button-add-10");
const timerButtonSubtract10 = document.querySelector("#timer-button-subtract-10");
const timerButtonPause = document.querySelector("#timer-button-pause");
const timerLabelCurrentExercise = document.querySelector("#timer-current-exercise");
const timerLabelTimeRemaining = document.querySelector("#timer-time-remaining");

let timeRemaining = 0;
let currentExerciseIndex = 0;
let currentSetIndex = 0;
let paused = true;

timerButtonPreviousPeriod.addEventListener("click", function() {
  if (currentExerciseIndex == 0 && currentSetIndex == 0) return;
  else {
    currentSetIndex--;
    if (currentSetIndex < 0) {
      currentExerciseIndex--;
      currentSetIndex = exercises[currentExerciseIndex].sets.length - 1;
    }
    timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  }
  refreshLabels();
});

timerButtonNextPeriod.addEventListener("click", nextPeriod);

function nextPeriod() {
  if (
    currentExerciseIndex == exercises.length - 1 &&
    currentSetIndex == exercises[currentExerciseIndex].sets.length - 1
  ) {
    return;
  } else {
    currentSetIndex++;
    if (currentSetIndex > exercises[currentExerciseIndex].sets.length - 1) {
      currentExerciseIndex++;
      currentSetIndex = 0;
    }
    timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  }
  refreshLabels();
}

timerButtonSubtract10.addEventListener("click", function() {
  timeRemaining -= 10;
  if (timeRemaining <= 0) {
    timeRemaining = 1;
  }
  refreshLabels();
});

timerButtonAdd10.addEventListener("click", function() {
  timeRemaining += 10;
  if (timeRemaining > exercises[currentExerciseIndex].sets[currentSetIndex]) {
    timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  }
  refreshLabels();
});

timerButtonPause.addEventListener("click", function() {
  paused = !paused;
});

function createTimer(exercises) {
  divTimer.classList.remove("hidden");
  timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  refreshLabels();

  setInterval(function() {
    if (!paused) {
      timeRemaining--;
      if (timeRemaining < 1) nextPeriod();
      refreshLabels();
    }
  }, 1000);
}

function refreshLabels() {
  timerLabelCurrentExercise.innerHTML = `${exercises[currentExerciseIndex].name} : Set ${currentSetIndex + 1}`;
  timerLabelTimeRemaining.innerHTML = secondsToMinSeconds(timeRemaining);
}

function createSchedule(exercises) {}
