function sumTimes(time1, time2) {
  // Split the strings into minutes and seconds
  const time1Split = time1.split(":");
  const time2Split = time2.split(":");

  // Convert the minutes and seconds to integers
  const time1Minutes = parseInt(time1Split[0]);
  const time1Seconds = parseInt(time1Split[1]);
  const time2Minutes = parseInt(time2Split[0]);
  const time2Seconds = parseInt(time2Split[1]);

  // Add the minutes and seconds
  let totalSeconds = time1Seconds + time2Seconds;
  let totalMinutes = time1Minutes + time2Minutes;
  if (totalSeconds >= 60) {
    // If the total number of seconds is more than or equal to 60,
    // increment the total number of minutes and subtract 60 from the total number of seconds
    totalMinutes += 1;
    totalSeconds -= 60;
  }

  // Convert the total minutes and seconds back to strings and pad with leading zeros if necessary
  const minutesString = totalMinutes.toString().padStart(2, "0");
  const secondsString = totalSeconds.toString().padStart(2, "0");

  // Return the combined time string
  return `${minutesString}:${secondsString}`;
}

