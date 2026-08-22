import confetti from 'canvas-confetti';

export function fireMilestoneConfetti(originX = 0.5, originY = 0.6) {
  // Fire multiple bursts of high-contrast electric cyan, emerald, violet, and gold confetti
  const count = 200;
  const defaults = {
    origin: { x: originX, y: originY },
    spread: 360,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#38bdf8', '#ffffff'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['circle', 'square'],
    });

    confetti({
      ...defaults,
      particleCount: 25,
      scalar: 0.8,
      shapes: ['circle'],
    });
  }

  shoot();
  setTimeout(shoot, 120);
  setTimeout(shoot, 250);
}

export function fireTaskConfetti(originX = 0.5, originY = 0.7) {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ['#06b6d4', '#10b981', '#38bdf8', '#facc15'],
    startVelocity: 25,
    ticks: 80,
  });
}
