'use strict';

const _          = require('underscore');
const config     = require('../../../data/toolkit.json');
const slugify    = require('slugify');

/**
 * -----------------------------------------------------------------------------
 * Constructor
 * -----------------------------------------------------------------------------
 */
const menu = {collapse: {}};


menu.toggle = () => {
	$('.f-menu-container').toggleClass('active');
};

menu.click = (e) => {
	e.preventDefault();

	let trg = $(e.currentTarget);
		trg.parents().find('.f-navbar-control').removeClass('active');
		trg.addClass('active');

	// Do search
	let fnd = $('.f-menu-container [data-search] input');
	let arr = fnd.val().split(' ');
	arr = _.without(arr, 'atom', 'molecule', 'organism', 'catalyst', 'templates', 'page');
	arr.push(trg.data('find'));

	arr = _.uniq(arr);
	let str = arr.join(' ');
	str = str.trim();

	fnd.val(str);

	$('.f-menu-container [data-search]').submit();
};

menu.change = () => {
    let url = window.location.href.split('/').pop();


    // Clear any .f-active classes
    $('.f-active').removeClass('f-active');


    // Find .f-menu a elements
    let active = [];
    $('.f-menu a').each(function () {
        let href = $(this).attr('href');
        if (url === href) {
            $(this).addClass('f-active');
            active = $(this);
        }
    });


    // Scroll the menu
    if (active.length > 0) {
        let m = $('.f-menu > ul');
        $(m).animate({
            scrollTop: active.offset().top
        });
    }


    // Scroll the page
    if (window.location.hash) {
        let elm = $(window.location.hash);
        if (elm.length > 0) {
            $('html,body').animate({
                scrollTop: elm.offset().top - 170
            }, 0);
        }
    }
};

menu.mouseover = () => {
    let body = $('body');
        body.addClass('f-menu-open');
};

menu.mouseout = () => {
    let body = $('body');
        body.removeClass('f-menu-open');
};

menu.collapse.add = (id) => {
    let prefix    = slugify(config.name.toLowerCase());
    let exp       = window.localStorage.getItem(prefix + '-collapsed');
    exp           = (exp) ? JSON.parse(exp) : [];
    exp.push(id);
    exp = JSON.stringify(_.uniq(exp));

    window.localStorage.setItem(prefix + '-collapsed', exp);
};

menu.collapse.remove = (id) => {
    let prefix    = slugify(config.name.toLowerCase());
    let exp       = window.localStorage.getItem(prefix + '-collapsed');
    exp           = (typeof exp !== 'undefined') ? JSON.parse(exp) : [];
    exp           = JSON.stringify(_.without(exp, id));

    window.localStorage.setItem(prefix + '-collapsed', exp);
};

menu.collapse.toggle = (e) => {
    let target    = $(e.currentTarget).parent();
    let id        = target.attr('id');
    let state     = target.attr('aria-expanded');
    state         = Boolean(state === 'true');

    target.attr('aria-expanded', !state);

    if (id) {
        id = '#' + id;
        if (state === true) {
            menu.collapse.add(id);
        } else {
            menu.collapse.remove(id);
        }
    }
};

menu.collapse.init = () => {
    let prefix    = slugify(config.name.toLowerCase());
    let exp       = window.localStorage.getItem(prefix + '-collapsed');
    exp           = (exp) ? JSON.parse(exp) : [];

    let active = $('.f-menu .f-active').closest('li[role="listitem"]');

    exp.forEach((item) => {
        let target = $(item);
        if (target.attr('id') === active.attr('id')) { return; }
        target.attr('aria-expanded', false);
    });
};

menu.initListeners = () => {
    $(window).on('hashchange', menu.change).trigger('hashchange');
	$(document).on('click', '.f-navbar-control', menu.click);

	$('.f-menu-container').on('mouseover', menu.mouseover);
    $('.f-menu-container').on('mouseout', menu.mouseout);
    $('[data-f-collapse]').on('click', menu.collapse.toggle);
};

menu.active = () => {
	menu.change();
};

menu.init = () => {
    if ($('.f-menu')[0].hasOwnProperty('__menu')) { return; }
    $('.f-menu')[0].__menu = menu;
    menu.initListeners();
    menu.collapse.init();
    $('.f-menu').nanoScroller();

    let firstRun = window.localStorage.getItem('init');
    if (!firstRun) {
        window.localStorage.setItem('init', true);

        $('#f-menu-container').addClass('active');
        setTimeout(function () {
            $('#f-menu-container').removeClass('active');
        }, 1000);
    }
};

$(function() {
    menu.init();
});


/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
module.exports = menu;
