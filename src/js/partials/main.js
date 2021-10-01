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

	$('body').css({'overflow': 'hidden', 'margin-right': getScrollbarWidth() + 'px'});

	function getScrollbarWidth() {
		var block = $('<div>').css({'height':'50px','width':'50px'});
		var indicator = $('<div>').css({'height':'200px'});

		$('body').append(block.append(indicator));

		var w1 = $('div', block).innerWidth();
		block.css('overflow-y', 'scroll');

		var w2 = $('div', block).innerWidth();
		$(block).remove();

		return (w1 - w2);
	}

	/* Body scroll lock by default */
	var isLocked = true,
			timer;

	timer = setTimeout(function () {
		playAnim();
		isLocked = false;
	}, 10000);


	lock = 0;
	eventDelay(window, 'mousewheel', function (down, up) {
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		if (down && lock == 0 && scrollTop == 0){
			lock = 1;
			clearTimeout(timer);
			playAnim();
		} else  if (up && lock == 0 && scrollTop <= 25){
			lock = 1;
			$('body').addClass('body-scroll-lock');
			$('.section-1').removeClass('top');
			$('.section-2').removeClass('top');
			$('.test').removeClass('anim-balls-zoom anim-balls-text');
			setTimeout(function () {
				$('.section-1').addClass('anim-title');
			}, 800);

			setTimeout(function (){
				lock = 0;
			},1000);
		}
	}, 300);

	function playAnim() {
		lock = 1;
		$('.section-1').addClass('top');
		$('.section-2').addClass('top');
		$('.section-1').removeClass('anim-title');

		setTimeout(function (){
			$('.test').addClass('anim-balls-zoom');
		},800);

		setTimeout(function (){
			$('.test').addClass('anim-balls-text');
		},1600);

		setTimeout(function (){
			$('body').removeClass('body-scroll-lock');
			lock = 0;
		},1000);
	}

	$('.test').addClass('anim-title');

	/* Test */
	var inputs = $('.test-ball input'),
			res = {
				a: 0,
				b: 0,
				c: 0
			},
			max = 0,
			keyVal,
			restartBtn = $('.results__restart');

	restartBtn.click(function () {
		$('div.test-ball input').each(function () {
			$(this).prop('checked', false);
		});

		res = {
			a: 0,
			b: 0,
			c: 0
		};

		$('.results').fadeOut(300);
		$('.test').fadeIn(300);

		$('body, html').animate({
			scrollTop: $('#start').offset().top
		}, 100);
	});

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

			for (var key in res) {
				var temp = res[key];

				if (max < temp) {
					max = temp;
					keyVal = key;
				}
			}

			$('body, html').animate({
				scrollTop: $('body').offset().top
			}, 100);

			$('.results[data-result="' + keyVal + '"]').fadeIn(300);
			$('.test').hide();

			console.log(max);
			console.log(res);
		}
	});
});


function normalizeWheelSpeed(event) {
	var normalized;
	if (event.wheelDelta) {
		normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
	} else {
		var rawAmmount = event.deltaY ? event.deltaY : event.detail;
		normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
	}
	return normalized;
}

function eventDelay(el, eventName, callback, delay) {
	var currentTime = (new Date()).getTime();
	var container = typeof el == 'object' ? $(el) : $(el);
	delay = delay || 1000;
	eventName = eventName || 'mousewheel';
	var block = false;
	if (eventName === 'mousewheel') {
		var indicator = new WheelIndicator({
			elem: document.querySelector('body'),
			preventMouse: false,
			callback: function(e){
				var nowTime = (new Date()).getTime();
				var diff = Math.abs((nowTime - currentTime) / delay);
				if (diff < 1) {
				} else {
					var up = e.direction == 'up';
					var down = e.direction == 'down';
					callback(down, up);
					currentTime = nowTime;
				}
			}
		});
	} else {
		container.on(eventName, function (event) {
			var nowTime = (new Date()).getTime();
			var diff = Math.abs((nowTime - currentTime) / delay);
			if (diff < 1.3) return;
			currentTime = nowTime;
			if (eventName == 'mousewheel') {
				var normalized = normalizeWheelSpeed(event)
				var down = normalized > 0;
				var up = normalized < 0;
				callback(down, up);
			} else if (eventName == 'keyup') {
				var normalized = event.keyCode
				var down = normalized == 40 || normalized == 39;
				var up = normalized == 38 || normalized == 37;
				callback(down, up);
			} else {
				callback();
			}
		});
	}

}