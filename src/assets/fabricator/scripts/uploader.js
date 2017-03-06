/**
 * Includes
 */
var hbs       = require('handlebars');
var creative  = require('./creative');
var Dropzone  = require('dropzone');
var DISQUS    = require('./disqus');
var slugify   = require('slugify');
var moment    = require('moment');



/**
 * Constructor
 */
var uploader = {folders: {}};


/**
 * Methods
 */
uploader.directories = (selector) => {
	selector = selector || '[data-folder-list]';

	var elms = $(selector);
	if (elms.length < 1) { return; }

	var data = {};

  var url = window.RESTAPI +'/upload/directory';

	$.ajax({
		data: data,
		type: 'GET',
		dataType: 'json',
		url: window.RESTAPI +'/upload/directory',
		success: function (result) { uploader.on.folder.get(result, elms); }
	});
};

uploader.on = {
	addedfile: function (file) {
		$('[data-dz-start-all]').prop('disabled', false);

		var ext = String(file.name.split('.').pop()).toLowerCase();
		if (ext === 'psd') {
			this.emit("thumbnail", file, "/assets/toolkit/images/fabricator/psd.png");
			return;
		}
	},

	complete: function (file, url) {
		// Update file status
		file.status = 'complete';

		// Get preview elment
		var preview = $(file.previewElement);

		// Update the upload button
		var btn = preview.find('[data-dz-start]');
		if (btn) {
			btn.removeClass('btn-outline-primary')
				.addClass('btn-outline-success')
				.html('Uploaded!');
		}

		// Remove the remove button
		var rmv = preview.find('[data-dz-remove]');
		if (rmv) {
			rmv.remove();
		}

		// Update the image url
		var img = preview.find('[data-dz-thumbnail]');
		if (img) {
			img.css('opacity', 1);
		}

		creative.updated = true;

		setTimeout(function () { preview.fadeOut(250); }, 2000);
	},

	folder: {
		edit: function () {
			var opened = false;
			$('[data-folder-input] input').each(function () {
				var readonly = $(this).prop('readonly');
				if (readonly === false) { opened = true; }
			});

			if (opened === true) { $('#folder-modal .modal-footer').slideDown(250); }
		},

		get: function (result, elms) {
			elms.html('');

			if (result.value) {
				if (result.value.folders) {

					window.FOLDER = (window.FOLDER === '') ? result.value.folders[0] : window.FOLDER;

					var dirs = result.value.folders;

					elms.each(function () {

						var src = $(this).data('folder-list');
						var tmp = hbs.compile($(src).html());
						var arr = [];
						for (var i = 0; i < dirs.length; i++) {
							var isActive = (window.FOLDER === dirs[i]);
							var d = {name: dirs[i], active: isActive};
							arr.push(tmp(d));
						}

						$(this).html(arr.join(''));
					});
				}
			}
		},

		input: function (e) {
			e.preventDefault();

			var v = $(this).find('input').val();
			if (v.length < 1) { return; }

			v = slugify(v);

			var src = $('#folder-input-template').html();
			if (!src) { return; }

			var tmp = hbs.compile(src)({name: v});
			$('#folder-input-list').prepend(tmp);

			this.reset();

			$('#folder-modal .modal-footer').slideDown(250);

			return true;
		},

		hidden: function (e) {
			$(this).find('form').first()[0].reset();
			$('#folder-modal .modal-footer').hide();
			$('[data-folder-input] input').attr('readonly', true);
		},

		shown: function (e) {
			$(this).find('input').first().focus();
		},

		remove: function (e) {
			var target = $(this).data('folder-remove');
			$(this).closest(target).first().remove();

			$('#folder-modal .modal-footer').slideDown(250);
		},

		save: function (e) {
			var data = {folders: []};

			$('#folder-input-list').find('input').each(function () {
				var v = $(this).val();
				if (v.length < 1) { return; }

				data.folders.push(v);
			});

			data.folders.sort();
			$.ajax({
				url: window.RESTAPI + '/upload/directory',
				data: data,
				type: 'POST',
				dataType: 'json'
			}).done(function (result) {
				$('#folder-modal').modal('hide');
				uploader.directories();
			});
		},

		select: function (e) {
			$('[data-folder-select]').removeClass('active');
			$(this).addClass('active');
		},

		toggle: function (e) {
			var elm = $(this).closest($(this).data('target')).find('input');
			if (elm.attr($(this).data('toggle'))) {
				elm.removeAttr($(this).data('toggle'));
			} else {
				elm.attr($(this).data('toggle'), $(this).data('toggle-value'));
			}
		}
	},

	modal: {
		hide: function (e) {
			if (creative.updated === true) { creative.get(); }
		},

		show: function (e) {
			creative.updated = false;

			// Set the folder text in the dropdown
			$('.folder-select').text(window.FOLDER);
		}
	},

	progress: function (file, per) {
		var preview = $(file.previewElement);

		// Update progress bar
		var pbar = preview.find('[data-dz-uploadprogress]');
			pbar.css('width', Math.floor(per) + '%');
	},

	removedfile: function (file) {

	},

	start: function (file) {
		var preview = $(file.previewElement);

		// Updated the upload button
		var btn = preview.find('[data-dz-start]');
		if (btn) {
			btn.prop('disabled', true);
			btn.html('Uploading...');
		}

		// Show progress bar
		var pbar = preview.find('[data-dz-uploadprogress]');
				pbar.parent().css('opacity', 1);
	},

	uploadClick: function () {
		var dz = $(this).parents().find('[data-dropzone]');

		if (dz.length < 1) { return; }
		if (!dz[0].__uploader) { return; }
		dz = dz[0].__uploader;

		var delay = 0;
		for (var i = 0; i < dz.files.length; i++) {
			if (dz.files[i]['status'] === 'complete') { continue; }
			uploader.uploadAuth(dz.files[i]);
		}

		$('[data-dz-start-all]').prop('disabled', true);
	},

};

uploader.post = (file, url, data, success) => {

	data['url']     = url;
	data['type']    = file.type;
	data['folder']  = window.FOLDER;
	data['project'] = window.PROJECT;
	data['file']    = slugify(file.name);
	data['ext']     = file.name.split('.').pop();

	$.ajax({
		url: window.RESTAPI + '/upload',
		data: data,
		type: 'POST',
		dataType: 'json',
    success: function (result) {
      if (typeof success === 'function') {
        success(file, url, result);
      }
    }
	});
};

uploader.put = (file, url, data, success) => {
  data['url']     = url;
	data['type']    = file.type;
	data['project'] = window.PROJECT;
	data['file']    = slugify(file.name);
	data['ext']     = file.name.split('.').pop();

  $.ajax({
		url: window.RESTAPI + '/upload',
		data: data,
		type: 'PUT',
		dataType: 'json',
    success: function (result) {
      if (typeof success === 'function') {
        success(file, url, result);
      }
    }
	});

};

uploader.upload = (file, sig, url, idx, success) => {

	uploader.on.start(file);

	var xhr = new XMLHttpRequest();
		xhr.open('PUT', sig, true);

		xhr.upload.onprogress = function (e) {
			var per = (e.loaded / e.total) * 100;
			uploader.on.progress(file, per);
		};

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					if (typeof success === 'function') {
						callback(file, url);
					} else {
            // Get the form values
            var preview = $(file.previewElement);
            var data = {};
            var frm = preview.find('input, textarea, select');
                frm.each(function () { data[this.name] = this.value; });

						uploader.post(file, url, data, uploader.on.complete);
					}
				} else {

				}
			}
		};

		xhr.send(file);
};

uploader.uploadAuth = (file, success) => {
	// Get preview elment
	var preview = $(file.previewElement);

	// Get file name
	var proj  = slugify(window.PROJECT);
	var fold  = window.FOLDER || null;

	var farr  = [proj];
	if (fold) { farr.push(slugify(fold)); }
	farr.push(slugify(file.name));

	var name  = farr.join('/');

	// Get the auth
	var data = {
		file: name,
		type: file.type,
		bucket: 'rafabuploads'
	};

	$.ajax({
		url: window.RESTAPI + '/upload/auth',
		data: data,
		type: 'GET',
		dataType: 'json'
	}).done(function (result) {
		uploader.upload(file, result.signature, result.url, success);
	});
};


/**
 * Initializer
 */
uploader.init = () => {

	/**
	 * Set up dropzon
	 * TODO: Refactor this so that it inits and removes on modal open/close
	 */
	$('[data-dropzone]').each(function () {
		var id = $(this).attr('id');
		if (!id) { return; }

		var tmp = $('#uploadTemplate');
			tmp = (tmp.length > 0) ? tmp.html() : '';

		var opts = {
			clickable         : true,
			autoProcessQueue  : false,
			previewTemplate   : tmp,
			previewsContainer : '.dropzone-previews',
			url               : 'http://localhost:3001/upload/auth'
		};

		this.__uploader = new Dropzone("#"+id, opts);
		this.__uploader.on('addedfile', uploader.on.addedfile);
		this.__uploader.on('removedfile', uploader.on.removedfile);
	});

	/**
	 * Listeners
	 */
	$(document).on('submit', '#folder-input', uploader.on.folder.input);
	$(document).on('click', '[data-folder-save]', uploader.on.folder.save);
	$(document).on('click', '[data-folder-remove]', uploader.on.folder.remove);
	$(document).on('click', '[data-toggle="readonly"]', uploader.on.folder.toggle);
	$(document).on('click', '[data-dz-start-all]', uploader.on.uploadClick);
	$(document).on('click', '[data-target="[data-folder-input]"]', uploader.on.folder.edit);
	$(document).on('click', '[data-folder-select]', uploader.on.folder.select);
	$(document).on('shown.bs.modal', '#folder-modal', uploader.on.folder.shown);
	$(document).on('hidden.bs.modal', '#folder-modal', uploader.on.folder.hidden);
	$(document).on('hide.bs.modal', '#upload-modal', uploader.on.modal.hide);
	$(document).on('show.bs.modal', '#upload-modal', uploader.on.modal.show);

	return uploader;
}


/**
 * Exports
 */
module.exports = uploader;
