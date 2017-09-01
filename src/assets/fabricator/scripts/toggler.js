'use strict';
const _          = require('underscore');
const toggler    = {};

toggler.controls = ['.f-item-notes', '.f-item-labels', '.f-item-dna', '.f-item-code'];

toggler.init = function () {
    toggler.expand();
};

toggler.add = function (id) {
    let exp    = window.localStorage.getItem('expanded');
    exp        = (exp) ? JSON.parse(exp) : [];

    exp.push(id);
    exp = JSON.stringify(_.uniq(exp));

    window.localStorage.setItem('expanded', exp);
};

toggler.remove = function (id) {
    let exp    = window.localStorage.getItem('expanded');
    exp        = (exp) ? JSON.parse(exp) : [];
    exp        = JSON.stringify(_.without(exp, id));

    window.localStorage.setItem('expanded', exp);
};

toggler.toggle = function (id, state) {
    if (!id) { return; }

    let target    = $(id);
    state         = state || !Boolean(target.attr('aria-expanded') !== 'false');

    target.attr('aria-expanded', state);

    if (state === true) {
        toggler.add(id);
    } else {
        toggler.remove(id);
    }
};

toggler.expand = function () {
    let exp      = window.localStorage.getItem('expanded');
    exp          = (typeof exp !== 'undefined') ? JSON.parse(exp) : [];
    let inter    = _.intersection(toggler.controls, exp);

    $('.f-global-control').removeClass('f-active');

    if (inter.length > 0) {
        inter.forEach((item) => {
            let btn = `.f-controls button[data-f-toggle-control="${item}"]`;
            toggler.toggle(item, true);
            setTimeout(function () { $(btn).addClass('f-active'); }, 500);
        });
    } else {
        exp.forEach((item) => {
            toggler.toggle(item, true);
        });
    }
};

$('[data-f-toggle-control]').on('click', function () {
    let id = $(this).data('f-toggle-control');
    if ($(this).hasClass('f-global-control')) {
        if ($(this).hasClass('f-active')) {
            $(this).removeClass('f-active');
        } else {
            $(this).addClass('f-active');
        }
    }
    toggler.toggle(id);
});

/**
 * Page load listener
 */
$(function () {
    toggler.init();
});

/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
module.exports = toggler;
