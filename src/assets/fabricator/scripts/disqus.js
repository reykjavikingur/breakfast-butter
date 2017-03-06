/**
 * Module Disqus for AJAX applications
 * (can be used in both RequireJS and CommonJS)
 *
 * includes or reloads the disqus script and updates the comment count on item lists
 *
 * Usage:
 * disqus.init(newIdentifier, newUrl, newTitle, newLanguage) - to include or reload the disqus block
 * disqus.remove() - to remove the disqus block (not often needed)
 * disqus.commentCount(_element, pluralTag, singularTag)
 *
 * Dependencies:
 * jquery
 */
define(function (jquery) {

		// your disqus shortname
		disqus_shortname = 'bs-fabricator';

		// your disqus public key
		disqusPublicKey = 'd1QJnB5f4jlM5eRESapv4R0z12ODUVBHc8CobIMj6AE2w7NKYGljCDrzGEnJVFp1';

		// any prefix you want to prepend to disqus_identifier or disqus_url
		//
		// IMPORTANT: in AJAX applications both disqus identifier and disqus url are needed
		// and because DISQUS only accepts the full hashbang #!
		// you can use this variable to include it if needed
		disqusBaseUrl = 'http://hongkiat.maxcdn.com/assets/'

	 /**
		* Updates an element with the comment count
		*
		* @param  _element                  The element (e.g. a jquery selector) that contains a "data-disqus-url" attribute
		* @param  pluralTag = 'comments'    A plural suffix for the number (when there's only one comment)
		* @param  singularTag = 'comment'   A singular suffix for the number (when there more than one comment)
		*/
		var commentCount = function(_element){
      // the disqus api allows to send an array of identifiers (or url's) for the requests
      // urlArray will hold those identifiers
      var urlArray = [];

      // for each element that has the data-disqus-url format its value and push it to the array
      _element.each(function () {
          var url = $(this).data('disqus-url');
          urlArray.push('link:' + url);
      });

      // make the request
      $.ajax({
         type: 'GET',
         url: "https://disqus.com/api/3.0/threads/list.jsonp",
         data: { api_key: disqusPublicKey, forum : disqus_shortname, thread : urlArray },
         cache: false,
         dataType: 'jsonp',
         success: function (result) {

            // for each thread returned
            for (var i in result.response) {
                var count = result.response[i].posts;
                if (count < 1) { continue; }

                // updates the content of the element
                $('[data-disqus-url="' + result.response[i].link + '"]').html(count);
            }
          }
      });
		};

	 /**
		* Removes the disqus element
		*/
		var remove = function(){
			$("iframe[title='Disqus']").remove();
		}

	 /**
		* Inserts or resets the disqus element
		*
		* @param  newIdentifier
		* @param  newUrl
		* @param  newTitle
		* @param  newLanguage
		*/
		var init =  function (newIdentifier, newUrl, newTitle, newLanguage) {

			// the disqus identifier
			disqus_identifier = newUrl;

			// the page title
			disqus_title = newTitle;

			// the disqus url
			// in AJAX applications both disqus identifier and disqus url are needed
			disqus_url = newUrl;

			// if the disqus element doesn't exists (i.e. the first call)
			// inserts the element (script)
			if (typeof DISQUS == 'undefined') {
					var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
					dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
					(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
			// else reloads the existing disqus element with the new data
			} else {
					DISQUS.reset({
							reload: true,
							config: function () {
									this.page.identifier = disqus_identifier;
									this.page.url = disqus_url;
									this.page.title = disqus_title;
									this.language = newLanguage;
							}
					});
			}
		};

	// returns the public functions
	return {
		init: init,
		commentCount: commentCount,
		remove: remove
	};

});
