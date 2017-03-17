export default (...args) => args
  .map(arg => (
    typeof arg === 'object'
      ? arg && Object.keys(arg).filter(className => arg[className]).join(' ')
      : arg
  ))
  .filter(className => className)
  .join(' ');
