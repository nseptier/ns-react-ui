export default (fn, time) => {
  let timeout;

  return function debounce(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
};
