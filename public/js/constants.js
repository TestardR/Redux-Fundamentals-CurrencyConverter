import keyMirror from 'keymirror';

export var ActionTypes = keyMirror({
  CHANGE_ORIGIN_AMOUNT: null,
  CHANGE_ORIGIN_CURRENCY: null,
  CHANGE_DESTINATION_CURRENCY: null
});

console.log('ActionTypes', ActionTypes);
