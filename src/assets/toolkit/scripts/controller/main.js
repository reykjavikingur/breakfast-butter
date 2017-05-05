// Bootstrap initializers
$(function () {
    // Tooltips
    if (typeof $().tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }

    // Popovers
    if (typeof $().popover === 'function') {
        $('[data-toggle="popover"]').popover();
        $('[data-toggle="popover-dismissable"]').popover();
    }
});
