'use strict';
const _ = require('underscore');


/**
 * -----------------------------------------------------------------------------
 * Constructor
 * -----------------------------------------------------------------------------
 */
const menu = {};


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
	arr = _.without(arr, 'atom', 'molecule', 'organism');
	arr.push(trg.data('find'));

	arr = _.uniq(arr);
	let str = arr.join(' ');
	str = str.trim();

	fnd.val(str);

	$('.f-menu-container [data-search]').submit();
};

menu.search = () => {
	$('.f-menu-container [data-search]').submit();
};


menu.initListeners = () => {
	$(document).on('click', '.f-navbar-control', menu.click);
	$(document).on('keyup', '.f-menu-container [data-search] input', menu.search);
};


menu.active = () => {
	let active = $('.f-active');
	if (active.length < 1) { return; }
	active.focus().blur();
};


menu.init = () => {
	menu.initListeners();
	setTimeout(menu.active, 200);
    $('.f-menu').nanoScroller({
        iOSNativeScrolling: true
    });
};



/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
module.exports = menu;
