const textAreaSchedule = document.querySelector("#schedule");
const buttonCreateSchedule = document.querySelector("#button-create-timer");

let exercises = [];

buttonCreateSchedule.addEventListener("click", function() {
  try {
    const schedule = textAreaSchedule.value;
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

const buttonPreviousPeriod = document.querySelector("#button-timer-previous-period");
const buttonNextPeriod = document.querySelector("#button-timer-next-period");
const buttonAdd10 = document.querySelector("#button-timer-add-10");
const buttonSubtract10 = document.querySelector("#button-timer-subtract-10");
const buttonPause = document.querySelector("#button-timer-pause");
const labelCurrentExercise = document.querySelector("#current-exercise");
const labelTimeRemaining = document.querySelector("#time-remaining");

let timeRemaining = 0;
let currentExerciseIndex = 0;
let currentSetIndex = 0;
let paused = true;

buttonPreviousPeriod.addEventListener("click", function() {
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

buttonNextPeriod.addEventListener("click", nextPeriod);

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

buttonSubtract10.addEventListener("click", function() {
  timeRemaining -= 10;
  if (timeRemaining <= 0) {
    timeRemaining = 1;
  }
  refreshLabels();
});

buttonAdd10.addEventListener("click", function() {
  timeRemaining += 10;
  if (timeRemaining > exercises[currentExerciseIndex].sets[currentSetIndex]) {
    timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  }
  refreshLabels();
});

buttonPause.addEventListener("click", function() {
  paused = !paused;
});

function createTimer(exercises) {
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
  labelCurrentExercise.innerHTML = `${exercises[currentExerciseIndex].name} : Set ${currentSetIndex + 1}`;
  labelTimeRemaining.innerHTML = secondsToMinSeconds(timeRemaining);
}
