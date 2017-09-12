import {url} from './const';

export const createSocket = function() {
  return new WebSocket('ws://' + url);
}
