export function getItem(key) {
  const val = localStorage.getItem(key);
  try {
    return JSON.parse(val);
  } catch (e) {
    return;
  }
}

export function setItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    return false;
  }
}
