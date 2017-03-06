/**
 * Constructor
 * @namespace
 */
var colors = {};

colors.init = (elms) => {
  elms = elms || $('.color-grid-item');

  elms.each(function (i) {
    var after = window.getComputedStyle(this, ':after');
    var before = window.getComputedStyle(this, ':before');
    var color = String(after.content).replace(/['"]+/g, '');
    var name = String(before.content).replace(/['"]+/g, '');

    var html = '<span>'+name+'</span>';
        html += '<span>'+color+'</span>';

    var tags = [color, color.replace(/\#/g, '')];
    var narray = name.split('-');
    if (narray.length < 1) { narray = [name]; }

    for (let i = 0; i < narray.length; i++) {
      tags.push(narray[i]);
    }

    $(this).addClass('clear-content');
    $(this).html(html);
    $(this).data('tags', tags.join(' '));

    if (i === 0) { console.log(color, name); }
  });
};

/**
 * Page load listener
 */
document.addEventListener("DOMContentLoaded", function(event) {
  colors.init();
});
