/*
 * Copyright 2009-2011 European Molecular Biology Laboratory
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function($, undefined) {
	if ($ == undefined)
		throw "jQuery not loaded";


	$.fn.extend({

		aeFeedbackForm : function(options) {
			return this.each(function() {
				new $.AEFeedbackForm(this, options);
			});
		}
	});

	$.AEFeedbackForm = function(feedbackWindow, options) {

		var $body = $("body");
		var $window = $(feedbackWindow);
		var $form = $window.find("form").first();
		var $message = $form.find("textarea[name='m']").first();
		var $email = $form.find("input[name='e']").first();
		var $page = $form.find("input[name='p']").first();
		var $ref = $form.find("input[name='r']").first();
		var $submit = $form.find("input[type='submit']").first();
		var $open = $(options.open).first();
		var $close = $(options.close).first();

		function doOpenWindow() {
			$body.bind("click", doCloseWindow);
			$window.bind("click", onWindowClick);

			$submit.removeAttr("disabled");
			$window.show();
			$message.val("").focus();
		}

		function doCloseWindow() {
			$window.unbind("click", onWindowClick);
			$body.unbind("click", doCloseWindow);
			$window.hide();
		}

		function onWindowClick(e) {
			e.stopPropagation();
		}

		$form.submit(function() {
			$submit.attr("disabled", "true");
			$.post(window.app.urls.baseUrl + "feedback", {
				m : $message.val(),
				e : $email.val(),
				p : $page.val(),
				r : $ref.val()
			}).always(function() {
				doCloseWindow();
			});
		});

		$open.click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			doOpenWindow();
		});

		$close.click(function(e) {
			e.preventDefault();
			doCloseWindow();
		});

		$form.find("input,textarea").keydown(function(e) {
			if (27 == e.keyCode) {
				doCloseWindow();
			}
		});
	};

	$.aeFeedback = function(e) {
		e.preventDefault();
		e.stopPropagation();
		$("li.feedback a").click();
	};

	$(function() {

		
		$("#ae-feedback").aeFeedbackForm({
			open : "li.feedback a",
			close : "#ae-feedback-close"
		});

	});

})(window.jQuery);

// I will clear and sumit the form with no data (refresh) [PT:44656245]
function aeClearField(sel) {
	$(sel).val("").focus();
	document.forms['bs_query_form'].submit();
}

// install a proxy to all jquery requests (I will need to change the URL when
// I'm calling the ebisearch in the internal environments

$.ajaxSetup({
	// crossDomain: true,
	beforeSend : function(xhr, opts) {
		//alert("url:"+opts.url);
		if (opts.url.indexOf("/ebisearch/") == 0
				&& !((opts.url.indexOf("www.ebi.ac.uk") == 0) || (opts.url
						.indexOf("wwwdev.ebi.ac.uk") == 0))) {
			opts.url = "http://www.ebi.ac.uk" + opts.url;
			opts.crossDomain = true;
		}

		 //alert(document.domain);
		// show progress spinner
	},
	complete : function() {
		// hide progress spinner	
	}
});
