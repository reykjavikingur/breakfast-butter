const menu = {};

menu.toggle = (e) => {
	if (e.type === 'mouseover') {
		$('.f-menu-container').addClass('active');
	} else {
		$('.f-menu-container').removeClass('active');
	}
};


menu.initListeners = () => {
	$('.f-menu-container').on('mouseover', menu.toggle);
	$('.f-menu-container').on('mouseout', menu.toggle);

};


menu.init = () => {
	menu.initListeners();
};

module.exports = menu;
