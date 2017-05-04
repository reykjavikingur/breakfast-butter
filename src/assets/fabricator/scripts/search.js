'use strict';

const _ = require('underscore');

/**
 * Constructor
 * @namespace
 */
const search = {
  submit: function (e) {
    e.preventDefault();

    let elms = $($(this).data('search'));
    if (elms.length < 1) { return; }


    let d = $(this).serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});


    if (d.find.length < 1) { elms.show(); return; }
    else { elms.hide(); }

    let f = String(d.find).toLowerCase().split(' ');

    elms.each(function () {
      let tags = $(this).data('tags');
          tags = String(tags).toLowerCase().split(' ');

      let matches = _.intersection(f, tags);
      if (matches.length === f.length) {
        $(this).show();
      }
    });
  }
};

search.initListeners = () => {
  $(document).on('submit', '[data-search]', search.submit);
  return search;
};

/**
 * Page load listener
 */
document.addEventListener("DOMContentLoaded", function() {
  search.initListeners();
});

module.exports = search;
