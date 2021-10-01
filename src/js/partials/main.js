$(window).on('load', function() {
	/* Share */
	window.auth = function (data) {
		$.ajax({
			type: "POST",
			url: "/authorize/",
			data: data,
			success: function(data) {
				if (data.length > 0) {
					checkAuth();
				}
			},
			error: function () {
				alert('Ошибка авторизации для продолжения');
			}
		});
	};

	function checkAuth() {
		$.ajax({
			type: "POST",
			url: "/get_hashcode/",
			success: function(data) {
				if (JSON.parse(data).hashcode != '' && JSON.parse(data).hashcode != undefined) {
					hash = JSON.parse(data).hashcode;

					$('.footer__socials').each(function () {
						var url = $(this).data('url');
						url += '&u='+encodeURIComponent(hash);
						$(this).attr('data-url', url);
					});
				}
			}
		});
	}

	var socialTypes =  {
		"fb": "http://www.facebook.com/share.php?u=",
		"vk": "http://vkontakte.ru/share.php?url=",
		"tw": "https://twitter.com/intent/tweet?url=",
		"ok": "http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl=",
	};

	function getMeta(name) {
		var meta = $('meta[property="og:'+name+'"]');
		return meta.length ? meta.attr('content') : '';
	}

	$('.footer__socials a').click(function() {
				var socialType;
				for (var name in socialTypes)
					if ($(this).hasClass(name)) { socialType = name; break; }
				if (socialType == undefined) return;

				var url = getMeta('url');
				var title = getMeta('title');
				var description = getMeta('description');
				var image = getMeta('image');

				var parent = $(this).closest('.footer__socials');
				var new_url = parent.attr('data-url');
				if (new_url) {
					url = new_url;
					image = '';
				}
				if (url == '') url = window.location.toString();

				var p_desc = parent.attr('data-description');
				if (p_desc) description = p_desc;
				var p_title = parent.attr('data-title');
				if (p_title) title = p_title;
				var p_image = parent.attr('data-image');
				if (p_image) image = p_image;

				var $slink = encodeURIComponent(url);
				switch (socialType) {
					case 'tw':
						$slink += '&text='+encodeURIComponent(title); break;
					case 'vk':
						if (image != '') $slink += '&image='+encodeURIComponent(image);
						if (title != '') $slink += '&title='+encodeURIComponent(title);
						if (description != '') $slink += '&description='+encodeURIComponent(description); break;
					case 'ok':
						if (image != '') $slink += '&st.imageUrl='+encodeURIComponent(image);
						if (description != '') $slink += '&st.comments='+encodeURIComponent(description); break;
					case 'fb':
						if (image != '') $slink += '&p[images][0]='+encodeURIComponent(image);
						if (title != '') $slink += '&p[title]='+encodeURIComponent(title);
						if (description != '') $slink += '&p[summary]='+encodeURIComponent(description); break;
				}

				if ($(this).data('mode') == 'nohash'){
					window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
				} else {
					if (hash === '') checkAuth();
					window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
					afterShare(socialType);
				}
			}
	);

	function afterShare(social) {
		$.ajax({
			type: "POST",
			url: "/new_share/",
			data: { social_share : social },
			success: function(data) {
				console.log('share ok');
			}
		});
	}


	/* Bubbles animation */
	$('.test').addClass('anim-title anim-balls-zoom');

	setTimeout(function () {
		$('.test').removeClass('anim-title');
	}, 2700);

	setTimeout(function () {
		$('.test').addClass('anim-balls-text');
	}, 2900);

	/* Test */
	var inputs = $('.test-ball input'),
			res = {
				a: 0,
				b: 0,
				c: 0
			},
			max = 0,
			keyVal;

	inputs.change(function () {
		var inputsChecked = $('.test-ball input:checked');

		if (inputsChecked.length >= 5) {
			inputsChecked.each(function () {
				switch ($(this).attr('data-option')) {
					case 'a':
						res.a += 1;
						break;
					case 'b':
						res.b += 1;
						break;
					case 'c':
						res.c += 1;
						break;
					case 'all':
						res.a += 1;
						res.b += 1;
						res.c += 1;
						break;
				}
			});

			$('body, html').animate({
				scrollTop: 0
			}, 400);
		}

		for (var key in res) {
			var temp = res[key];

			if (max < temp) {
				max = temp;
				keyVal = key;
			}
		}

		$('.results[data-result="' + keyVal + '"]').fadeIn(300);
	});
});