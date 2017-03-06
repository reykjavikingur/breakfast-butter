// Bootstrap initializers
$(function () {
  /**
   * Tooltips
   */
  $('[data-toggle="tooltip"]').tooltip();

  /**
   * Popovers
   */
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="popover-dismissable"]').popover();


  /**
   * Tags Input
   */
  $('input[type="tags"]').tagsInput({delimiter: [',', ';', ' ']});
});
