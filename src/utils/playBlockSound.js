const pianoSounds = Array.from({ length: 25 }, (_, index) => {
  const audio = new Audio(`/sounds/piano-${index}.mp3`);
  audio.preload = "auto";
  return audio;
});

let lastPlayedCoordinate = null;

function playBlockSound(row, col) {
  if (
    lastPlayedCoordinate &&
    lastPlayedCoordinate.row === row &&
    lastPlayedCoordinate.col === col
  ) {
    return;
  }

  if (
    row < 0 ||
    row >= 5 ||
    col < 0 ||
    col >= 5
  ) {
    return;
  }

  lastPlayedCoordinate = { row, col };
  const index = row * 5 + col;
  const audio = pianoSounds[index];

  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.error("Unable to play piano sound:", error);
  });


  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 500);
}

export default playBlockSound;