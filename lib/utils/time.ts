export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Helper functions for timeline markers
export function getTimeMarkers(duration: number) {
  const markers = {
    major: [] as number[],
    minor: [] as number[],
    micro: [] as number[],
  };

  //  generate evenly spaced markers within 2-98% range
  const generateMarkers = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      // Calculate percentage between 2% and 98%
      const percentage = 0.02 + (0.96 * (i + 1)) / (count + 1);
      return percentage * duration;
    });
  };

  if (duration <= 10) {
    // For very short videos (under 10s)
    markers.major = generateMarkers(4); // 4 major markers
    markers.minor = generateMarkers(8); // 8 minor markers (between majors)
    markers.micro = generateMarkers(16); // 16 micro markers (between minors)
  } else if (duration <= 60) {
    // Under 1 minute
    markers.major = generateMarkers(6); // 6 major markers
    markers.minor = generateMarkers(12); // 12 minor markers
    markers.micro = generateMarkers(24); // 24 micro markers
  } else if (duration <= 300) {
    // Under 5 minutes
    markers.major = generateMarkers(5); // 5 major markers
    markers.minor = generateMarkers(10); // 10 minor markers
    markers.micro = generateMarkers(20); // 20 micro markers
  } else {
    // Over 5 minutes
    markers.major = generateMarkers(6); // 6 major markers
    markers.minor = generateMarkers(12); // 12 minor markers
    markers.micro = generateMarkers(24); // 24 micro markers
  }

  // Filter out minor markers that are too close to major markers
  const majorTimes = new Set(markers.major);
  markers.minor = markers.minor.filter((time) => {
    return !markers.major.some(
      (majorTime) => Math.abs(majorTime - time) < duration * 0.02
    );
  });

  // Filter out micro markers that are too close to minor or major markers
  const allLargerMarkers = new Set([...markers.major, ...markers.minor]);
  markers.micro = markers.micro.filter((time) => {
    return !Array.from(allLargerMarkers).some(
      (largerTime) => Math.abs(largerTime - time) < duration * 0.01
    );
  });

  return markers;
}
