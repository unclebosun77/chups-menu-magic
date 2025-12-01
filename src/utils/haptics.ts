export const vibrate = (ms: number = 20) => {
  if (window.navigator && "vibrate" in window.navigator) {
    window.navigator.vibrate(ms);
  }
};
