import confetti from 'canvas-confetti';

export function fireMilestoneConfetti(originX = 0.5, originY = 0.6) {
  const defaults = {
    origin: { x: originX, y: originY },
    spread: 360,
    ticks: 90,
    gravity: 0.85,
    decay: 0.94,
    startVelocity: 28,
    disableForReducedMotion: true,
    colors: ['#000000', '#DC2626', '#4B5563', '#E5E7EB'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 36,
      scalar: 1.0,
      shapes: ['square'],
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      shapes: ['square'],
    });
  }

  shoot();
  setTimeout(shoot, 120);
  setTimeout(shoot, 240);
}

export function fireTaskConfetti(originX = 0.5, originY = 0.7) {
  confetti({
    particleCount: 45,
    spread: 65,
    origin: { x: originX, y: originY },
    colors: ['#000000', '#DC2626', '#4B5563'],
    shapes: ['square'],
    startVelocity: 24,
    ticks: 75,
    disableForReducedMotion: true,
  });
}
