var _ = require('underscore');

/**
 * Constructor
 * @namespace
 */
var search = {
  submit: function (e) {
    e.preventDefault();

    var elms = $($(this).data('search'));
    if (elms.length < 1) { return; }


    var d = $(this).serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});


    if (d.find.length < 1) { elms.show(); return; }
    else { elms.hide(); }

    var f = String(d.find).toLowerCase().split(' ');

    elms.each(function () {
      var tags = $(this).data('tags');
          tags = String(tags).toLowerCase().split(' ');

      var matches = _.intersection(f, tags);
      if (matches.length == f.length) {
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
document.addEventListener("DOMContentLoaded", function(event) {
  search.initListeners();
});

module.exports = search;
