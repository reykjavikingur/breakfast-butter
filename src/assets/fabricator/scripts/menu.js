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
	arr = _.without(arr, 'atom', 'molecule', 'organism', 'catalyst', 'template', 'page');
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

menu.initListeners = () => {
    $(window).on('hashchange', menu.change).trigger('hashchange');
	$(document).on('click', '.f-navbar-control', menu.click);
	$(document).on('keyup', '.f-menu-container [data-search] input', menu.search);
};


menu.active = () => {
	menu.change();
};


menu.init = () => {
	menu.initListeners();
	setTimeout(menu.active, 500);
    $('.f-menu').nanoScroller();
};



/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
module.exports = menu;
