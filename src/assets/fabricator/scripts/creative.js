/**
 * Required modules
 */

var _         = require('underscore');
var hbs       = require('handlebars');
var Clipboard = require('clipboard');
var DISQUS    = require('./disqus');
var Dropzone  = require('dropzone');
var moment    = require('moment');


/**
 * Contstructor
 * @namespace
 */
var creative = {updated: false, uploads: {}};


/**
 * draw function
 * @description Draws the creative tile to the container.
 * @params tile {Object} The data subscriber.
 */
creative.draw = (tile) => {
  var src = $('#creative-tile-template').html();
  if (!src) { return; }
  var tmp = hbs.compile(src)(tile);
  $('[data-creative-tiles]').append(tmp);
};


/**
 * get function
 * @description Retrieves list of creative files for the current project.
 */
creative.get = (append) => {

  // Clear the container
  if (append !== true) { $('[data-creative-tiles]').html(''); }

  var data = {
    project: window.PROJECT,
    has: ['download', 'url']
  };

  var hsh = window.location.hash;
  if (hsh) {
    hsh = hsh.substring(1).toLowerCase().split('/');
    hsh.shift();

    var hobj = {};
    for (var i = 0; i < hsh.length; i++) {
      var p = hsh[i];
      var v = hsh[i+1];

      if (typeof v === 'undefined') { break; }

      hobj[p] = v;
    }

    if (typeof hobj['f'] !== 'undefined') {
      data['folder'] = hobj.f;
      window.FOLDER = hobj.f;
    }
    if (typeof hobj['s'] !== 'undefined') { data['skip'] = hobj.s; }
  }

  $('.folder-select').text(window.FOLDER);

  $.ajax({
    data: data,
    type: 'GET',
    dataType: 'json',
    url: window.RESTAPI+'/upload',
    success: creative.on.get.success
  });
};


/**
 * getComments function
 * @description Retrieve comment counts from disqus.
 */
creative.getComments = () => {
  var elms = $('[data-disqus-url]');
  if (elms.length > 0) { DISQUS.commentCount(elms); }

  return creative;
};


/**
 * initListener
 * @description Set up listeners related to the creative module.
 */
creative.initListeners = () => {

  $(document).on('shown.bs.modal', '#creative-modal', creative.on.modal.shown);
  $(document).on('show.bs.modal', '#creative-modal', creative.on.modal.show);
  $(document).on('hide.bs.modal', '#creative-modal', creative.on.modal.hide);
  $(document).on('show.bs.modal', '#creative-edit-modal', creative.on.editor.show);
  $(document).on('submit', '#creative-edit-form', creative.on.editor.submit);
  $(document).on('click', '[data-creative-delete]', creative.on.editor.delete);

  if ($('[data-creative-tiles]').length > 0) {
    $(window).on('hashchange', creative.get);
    creative.get();
  }

  return creative;
};


/**
 * moveModals function
 * @description Moves all .modal elements to the <body> so that they are on
 * top of the backdrop.
 */
creative.moveModals = () => {
  $('.modal').each(function () { $('body').append($(this)); });

  return creative;
};


/**
 * Event Handlers
 */
creative.on = {
  editor: {
    delete: function (e) {
      console.log($(this).data('creative-delete'));
    },

		show: function (e) {
      var oid   = $(e.relatedTarget).data('objectid');
      var data  = creative.uploads[oid];
      var modal = $(this);

      // Get content zone
      var img = modal.find('.creative-edit img');
          img.attr('src', data.url);

      // Set the download link
      modal.find('.download-link').attr('href', data.download);

      // Get form fields
      modal.find('input, textarea, select').each(function () {
        var key = $(this).attr('name');
        var val = data[key];
            val = (key === 'tags') ? val.join(', ') : val;

        $(this).val(val);
      });

      // Set the delete object id
      $('[data-creative-delete]').data('creative-delete', oid);
		},

    submit: function (e) {
      e.preventDefault();
      var data = {};
      $(this).find('input, textarea, select').each(function () {
        var key = this.name;
        var val = this.value;

        data[key] = val;
      });

      $.ajax({
        data: data,
        type: 'PUT',
        dataType: 'json',
        url: window.RESTAPI+'/upload',
        success: creative.on.put
      });
    }
	},

  get: {
    success: function (results) {
      for (var i = 0; i < results.length; i++) {
        var data = results[i];
            data.createdAt = moment(data.createdAt).format('MM/DD/YY hh:mma');
            data.updatedAt = moment(data.updatedAt).format('MM/DD/YY hh:mma');

        if (data.createdAt === data.updatedAt) {
          delete data.updatedAt;
        }

        // Add the item to the creatve.uploads object
        creative.uploads[data.objectId] = data;

        creative.draw(data);
      }
      creative.getComments();
    }
  },

  modal: {
    hide: function (e) {
      var modal   = $(this);
      var elm = $('[data-disqus-url="'+$(this).data('url')+'"]');
      DISQUS.commentCount(elm);
    },

    show: function (e) {

      var button  = $(e.relatedTarget);
      var oid     = button.data("objectid");
      var data    = creative.uploads[oid];
      var modal   = $(this);
      var title   = modal.find('.modal-title');

      // Set the modal id (the image url)
      modal.data('url', data.download);

      // Set the title
      title.html(data.name);

      // Set the download button link
      var dbtn = modal.find('a[aria-label="download"]');
          dbtn.attr('href', data.download);

      // Get content zone
      var body = modal.find('.creative-preview').html('');

      var html = [];

      if (button.data('action') === 'view') {
        html.push('<div><a href="'+data.url+'" target="_blank"><img src="'+data.url+'" /></a></div>');
      }

      if (button.data('action') === 'comment') {
        html.push('<div><a href="'+data.url+'" target="_blank"><img src="'+data.url+'" /></a></div>');
        html.push('<div class="disqus-container"><div id="disqus_thread"></div></div>');
      }
      body.html(html.join(''));
    },

    shown: function (e) {
      var button  = $(e.relatedTarget);
      var oid     = button.data("objectid");
      var data    = creative.uploads[oid];
      if (button.data('action') === 'comment') {
        DISQUS.init(data.download, data.download, data.title);
      }
    }
  },

  put: function(result) {
    console.log(result);
  }
};


creative.init = () => {
  $('[data-clipboard-target]').each(function () {
    this.__clipboard = new Clipboard('[data-clipboard-target]');
  });
  creative.initListeners().moveModals();
  return creative;
}


/**
 * Exports
 */
module.exports = creative;
