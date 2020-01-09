/*
Support Functions
*/
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

/*
Schedule Input
*/
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
      if (setTimes.length == 0) throw "Each exercise needs atleast one set.";
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

/*
Schedule Playback
*/
const divTimer = document.querySelector(".timer");
const timerButtonPreviousPeriod = document.querySelector("#timer-button-previous-period");
const timerButtonNextPeriod = document.querySelector("#timer-button-next-period");
const timerButtonAdd10 = document.querySelector("#timer-button-add-10");
const timerButtonSubtract10 = document.querySelector("#timer-button-subtract-10");
const timerButtonPause = document.querySelector("#timer-button-pause");
const timerLabelCurrentExercise = document.querySelector("#timer-current-exercise");
const timerLabelTimeRemaining = document.querySelector("#timer-time-remaining");

const divSchedule = document.querySelector(".schedule");
const listSchedule = document.querySelector("#schedule-list");

const beepThreeSound = document.querySelector("#sound-beep-three");
const boxingBellSound = document.querySelector("#sound-boxing-bell");

let timeRemaining = 0;
let currentExerciseIndex = 0;
let currentSetIndex = 0;
let paused = true;

function createTimer(exercises) {
  divTimer.classList.remove("hidden");
  divSchedule.classList.remove("hidden");
  timeRemaining = exercises[currentExerciseIndex].sets[currentSetIndex];
  createSchedule();
  refreshLabels();

  setInterval(function() {
    if (!paused) {
      timeRemaining--;
      if (timeRemaining == 20) {
        beepThreeSound.play();
      }
      if (timeRemaining < 1) {
        timeRemaining = 0;
        boxingBellSound.play();
        nextPeriod();
      }
      refreshLabels();
    }
  }, 1000);
}

function createSchedule() {
  let output = "";
  for (let i = 0; i < exercises.length; i++) {
    let setOutput = "";
    for (let j = 0; j < exercises[i].sets.length; j++) {
      setOutput += `<span>${secondsToMinSeconds(exercises[i].sets[j])}</span>`;
    }
    output += `
    <li class="schedule-list-item"><span>${exercises[i].name}</span><br>${setOutput}</li>
    `;
  }
  listSchedule.innerHTML = output;
}

function refreshLabels() {
  timerLabelCurrentExercise.innerHTML = `${exercises[currentExerciseIndex].name} : Set ${currentSetIndex + 1}`;
  timerLabelTimeRemaining.innerHTML = secondsToMinSeconds(timeRemaining);

  const listItems = listSchedule.querySelectorAll("li");
  for (let i = 0; i < exercises.length; i++) {
    const listItem = listItems[i];
    if (currentExerciseIndex == i) {
      listItem.firstChild.classList.add("selected");
    } else {
      listItem.firstChild.classList.remove("selected");
    }
    for (let j = 0; j < exercises[i].sets.length; j++) {
      if (currentExerciseIndex == i && currentSetIndex == j) {
        listItem.childNodes[j + 2].classList.add("selected");
      } else {
        listItem.childNodes[j + 2].classList.remove("selected");
      }
    }
  }
}

/*
Time playback
*/
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
