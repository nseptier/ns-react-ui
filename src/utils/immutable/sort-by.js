export default (key, options = {}) => {
  const { ignoreCase = true, nullFirst = false, order = 'ASC' } = options;

  return (...items) => {
    let [a, b] = items.map((item) => {
      const value = item.getIn([].concat(key));
      return (ignoreCase && value && value.toString)
        ? value.toString().toLowerCase()
        : value;
    });
    let [c, d] = [a, b];

    if (order.toUpperCase() === 'DESC') [a, b] = [b, a];
    if ((nullFirst && order.toUpperCase() === 'ASC')
      || (!nullFirst && order.toUpperCase() !== 'ASC')) {
      [c, d] = [d, c];
    }
    return (c === undefined) - (d === undefined)
      || (c === null) - (d === null)
      || +(a > b) || +(a === b) - 1;
  };
};
