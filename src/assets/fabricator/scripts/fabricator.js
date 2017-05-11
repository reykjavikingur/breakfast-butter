
require('./prism');
require('./colors');
require('./search');
require('./nanoscroll');

const fabricator    = window.fabricator = {};
const menu          = require('./menu');

/**
 * Default options
 * @type {Object}
 */
fabricator.options = {
  toggles: {
    labels: true,
    notes: false,
    code: false,
  },
  mq: '(min-width: 60em)',
};


/**
 * Feature detection
 * @type {Object}
 */
fabricator.test = {};

// test for sessionStorage
fabricator.test.sessionStorage = (() => {
  const test = '_f';
  try {
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

// create storage object if it doesn't exist; store options
if (fabricator.test.sessionStorage) {
  sessionStorage.fabricator = sessionStorage.fabricator || JSON.stringify(fabricator.options);
}


/**
 * Get current option values from session storage
 * @return {Object}
 */
fabricator.getOptions = () => {
  return (fabricator.test.sessionStorage) ? JSON.parse(sessionStorage.fabricator) : fabricator.options;
};

/**
 * Handler for preview and code toggles
 * @return {Object} fabricator
 */
fabricator.allItemsToggles = () => {

  const itemCache = {
    labels: document.querySelectorAll('[data-f-toggle="labels"]'),
    notes: document.querySelectorAll('[data-f-toggle="notes"]'),
    code: document.querySelectorAll('[data-f-toggle="code"]'),
  };

  const toggleAllControls = document.querySelectorAll('.f-controls [data-f-toggle-control]');
  const options = fabricator.getOptions();

  // toggle all
  const toggleAllItems = (type, value) => {

    const button = document.querySelector(`.f-controls [data-f-toggle-control=${type}]`);
    const items = itemCache[type];

    for (let i = 0; i < items.length; i++) {
      if (value) {
        items[i].classList.remove('f-item-hidden');
      } else {
        items[i].classList.add('f-item-hidden');
      }
    }

    // toggle styles
    if (value) {
      button.classList.add('f-active');
    } else {
      button.classList.remove('f-active');
    }

    // update options
    options.toggles[type] = value;

    if (fabricator.test.sessionStorage) {
      sessionStorage.setItem('fabricator', JSON.stringify(options));
    }

  };

  for (let i = 0; i < toggleAllControls.length; i++) {

    toggleAllControls[i].addEventListener('click', (e) => {

      // extract info from target node
      const type = e.currentTarget.getAttribute('data-f-toggle-control');
      const value = e.currentTarget.className.indexOf('f-active') < 0;

      // toggle the items
      toggleAllItems(type, value);

    });

  }

  // persist toggle options from page to page
  Object.keys(options.toggles).forEach((key) => {
    toggleAllItems(key, options.toggles[key]);
  });

  return fabricator;

};


/**
 * Handler for single item code toggling
 */
fabricator.singleItemToggle = () => {

  const itemToggleSingle = document.querySelectorAll('.f-item-group [data-f-toggle-control]');

  // toggle single
  const toggleSingleItemCode = (e) => {
    const group = e.currentTarget.parentNode.parentNode.parentNode;
    const type = e.currentTarget.getAttribute('data-f-toggle-control');
    group.querySelector(`[data-f-toggle=${type}]`).classList.toggle('f-item-hidden');
  };

  for (let i = 0; i < itemToggleSingle.length; i++) {
    itemToggleSingle[i].addEventListener('click', toggleSingleItemCode);
  }

  return fabricator;

};


/**
 * Page load listener
 */
document.addEventListener("DOMContentLoaded", function() {
    menu.init();
});


/**
 * Initialization
 */
fabricator.allItemsToggles().singleItemToggle();
