const check = () => {
  if ('serviceWorker' in navigator) {
    console.log('yes it is present');
  }
};
module.exports = {
  check,
};
