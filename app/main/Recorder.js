import puppeteer from 'puppeteer';
import EventEmitter from 'events';
import util from 'util';
import fs from 'fs';

const EVENTS_TO_RECORD = {
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  CHANGE: 'change',
  KEYDOWN: 'keydown',
  SELECT: 'select',
  SUBMIT: 'submit',
  LOAD: 'load',
  UNLOAD: 'unload'
};

const ELEMENTS_TO_BIND = [
  'input',
  'textarea',
  'a',
  'button',
  'select',
  'option',
  'label',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'div',
  'span',
  'img'
];

const FINDER_PATH = require ? require.resolve('@medv/finder') : null;
const CSSESC_PATH = require ? require.resolve('cssesc') : null;

const readFilePromised = util.promisify(fs.readFile);

/*
const PPTR_ACTIONS = {
  GOTO: 'goto*',
  VIEWPORT: 'viewport*',
  WAITFORSELECTOR: 'waitForSelector*',
  NAVIGATION: 'navigation*',
  NAVIGATION_PROMISE: 'navigation-promise*',
  FRAME_SET: 'frame-set*'
}
 */

export default class Recorder extends EventEmitter {
  constructor() {
    super();

    this.browser = null;
    this.page = null;
  }

  async start({ initialScript }) {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = (await this.browser.pages()).pop();

    console.log(initialScript);

    await eval(`
      async (page) => {
        ${initialScript}
      };
    `)(this.page);

    const initFunction = (events, elements) => {
      function getCoordinates (evt) {
        const eventsWithCoordinates = {
          mouseup: true,
          mousedown: true,
          mousemove: true,
          mouseover: true
        }
        return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
      }


      // function formatDataSelector (element, attribute) {
      //  return `[${attribute}=${element.getAttribute(attribute)}]`
      // }

      let previousEvent = null;
      const listener = (event) => {
        if (previousEvent && previousEvent.timeStamp === event.timeStamp) return;
        previousEvent = event;

        const selector = window.finder(event.target, { seedMinLength: 5, optimizedMinLength: 10 });

        // const selector = event.target.hasAttribute && event.target.hasAttribute(this.dataAttribute)
        //   ? formatDataSelector(event.target, this.dataAttribute)
        //   : window.finder(event.target, { seedMinLength: 5, optimizedMinLength: 10 });

        window.captureEvent({
          selector: selector,
          value: event.target.value,
          tagName: event.target.tagName,
          action: event.type,
          keyCode: event.keyCode ? event.keyCode : null,
          href: event.target.href ? event.target.href : null,
          coordinates: getCoordinates(event)
        });
      };

      Object
        .values(events)
        .forEach((event) => window.addEventListener(event, listener, true));
    }

    const finderPkgString = await readFilePromised(FINDER_PATH, 'utf8');
    const cssescPkgString = await readFilePromised(CSSESC_PATH, 'utf8');
    await this.page.evaluateOnNewDocument(`
      var module = {};
      ${cssescPkgString}
      window.cssesc = module.exports;
      var exports = {};
      ${finderPkgString.replace('require("cssesc")', 'window.cssesc')}
      window.finder = exports.default;
    `);
    await this.page.evaluate(`
      var module = {};
      ${cssescPkgString}
      window.cssesc = module.exports;
      var exports = {};
      ${finderPkgString.replace('require("cssesc")', 'window.cssesc')}
      window.finder = exports.default;
    `);
    await this.page.evaluate(initFunction, EVENTS_TO_RECORD, ELEMENTS_TO_BIND);
    await this.page.evaluateOnNewDocument(initFunction, EVENTS_TO_RECORD, ELEMENTS_TO_BIND);
    await this.page.exposeFunction('captureEvent', (msg) => this._captureEvent(msg));
  }

  _captureEvent(msg) {
    const HEX_ESC = /\\(?:([0-9a-fA-F]{6})|([0-9a-fA-F]{1,5})(?: |(?![0-9a-fA-F])))/g;
    const OTHER_ESC = /\\(.)/g;
    function unesc (str) {
        str = str.replace(HEX_ESC, (_, hex1, hex2) => {
            let hex = hex1 || hex2;
            let code = parseInt(hex, 16);
            return String.fromCharCode(code);
        });
        str = str.replace(OTHER_ESC, (_, char) => char);
        return str;
    }

    console.log('EVENT!!!!!!');
    console.log(msg.selector);
    console.log(msg.action);
    const selector = unesc(msg.selector);
    console.log(selector);
    console.log('DONE!!!!!!');


    switch (msg.action) {
      case 'click':
        this._emitLine(`await page.waitForSelector('${selector}');`);
        this._emitLine(`await page.click('${selector}');`);
        break;
    }
  }

  _emitLine(line) {
    this.emit('line', line);
  }
}
