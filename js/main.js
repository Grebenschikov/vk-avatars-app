var callbacks = {};

$(function() {
	var query = {},
		photoURL = 'img/default.png',
		avatar = $('.avatar'),
		thumbnails = $('.thumbnail'),
		markURL = 'img/mark_center.png',
		mark = $('.mark'),
		rotate = 0,
		canmove = false,
		callbacksCouter = 0,
		utils = $('.utils');

	thumbnails.click(function(e) {
		thumbnails.removeClass('current');
		markURL = $(e.currentTarget).addClass('current').find('img').attr('src');
		mark.css('background-image', 'url("' + markURL + '")');
	});

	$('#backer').change(function() {
		mark.toggleClass('clean');
	})

	$('#rotator').on('input', function(e) {
		rotate = parseInt($(e.currentTarget).val() - 180) || 0;
		mark.css('transform', 'rotate(' + rotate + 'deg)');
	})

	$('#saver').click(function() {
		createImage(function(data) {
			$('<a />').attr({href: data, download: "ava.png"})[0].click();
		})
	})

	$('#submiter').click(function() {
		createImage(function(img) {
			VK.api('photos.getOwnerPhotoUploadServer', function(data) {
				var url
				try {
					url = data.response.upload_url;
				} catch (_) {
					showError('something')
					return
				}
				sendFile(url, img, function(data) {
					if (data == null) {
						showError('something')
						return
					}

					VK.api('photos.saveOwnerPhoto', {
						server: data.server,
						hash: data.hash,
						photo: data.photo
					}, function(data) {
						if (data.response && data.response.photo_hash) {
							VK.callMethod('showProfilePhotoBox', data.response.photo_hash)
						} else 
							showError('something')
					})
				})
			})					
		})
	})

	mark.on('mousedown', function() {
		canmove = true
	})

	$('body').on('mouseup', function() {
		canmove = false
	})

	avatar.on('mousemove', function(e) {
		if (canmove) {
			console.log(e);
			mark.css({top: e.clientY - 30 - mark.height()/2, left: e.clientX - 20 - mark.width()/2});
		}
	})

	function createImage(cb) {
		var cnv = document.createElement('canvas');
		var _avatar = new Image();
		_avatar.setAttribute('crossOrigin', 'anonymous')
		var _mark = new Image();
		_mark.setAttribute('crossOrigin', 'anonymous')
		var i = 0;
		_avatar.onload = _mark.onload = function() {
			if (++i != 2) return;
			cnv.width = _avatar.width;
			cnv.height = _avatar.height;
			var ctx = cnv.getContext("2d");
			ctx.drawImage(_avatar, 0, 0);
			var cf = (_avatar.width / avatar.width());
			var top = (parseInt(mark.css('top')) || 0) * cf,
				left = (parseInt(mark.css('left')) || 0) * cf,
				width = parseInt(mark.width()) * cf,
				height = parseInt(mark.height()) * cf;
			var rotation = rotate * Math.PI/180;
			ctx.translate(left + width/2, top + height/2);
			ctx.rotate(rotation);
			ctx.drawImage(_mark, -(width/2), -(height/2), width, height);
			cb && cb(cnv.toDataURL());
		}
		_avatar.src = photoURL;
		_mark.src = markURL;		
	} 

	function sendFile(url, img, cb) {
		$('#submiter').find('span').css('visibility', 'hidden');
		$('#submiter').find('img').css('visibility', 'visible');
		
		function _cb(data) {
			$('#submiter').find('span').css('visibility', 'visible');
			$('#submiter').find('img').css('visibility', 'hidden');
			cb(data);
		}

		var img = img.substr(22);
		if (swfobject.hasFlashPlayerVersion("1")) {
			var i = callbacksCouter++;
			var div = $('<div />', {id: "loader" + i}).appendTo(utils);
			callbacks[i] = function(id, type, data) {
				if (type == 'inited') {
					console.log('Inited', id);
					return
				} else if (type == 'success') {
					try {
						var data = JSON.parse(data);
						_cb(data);
					} catch (_) {
						_cb(null);
					}
				} else 
					_cb(null);

				$('#loader' + i).remove();
				delete callbacks[i];
			}
			swfobject.embedSWF("swf/loader.swf", "loader" + i, "1", "1", "1.0.0", "swf/expressInstall.swf", {
				url: url,
				img: encodeURIComponent(img),
				callback: 'callbacks[' + i + ']',
				id: i
			}, { allowScriptAccess: "always" });
		} else {
			$.post('//package.su/mdk/save', {
				viewer_id: query['viewer_id'],
				auth_key: query['auth_key'],
				api_id: query['api_id'],
				url: url,
				img: img
			}, function(data) {
				console.log(data);
				_cb(data.response ? data.response : null)
			}).fail(function() {
				_cb(null)
			})
		}
	}

	function showError() {
		alert('Ошибка')
	}

	location.search.substr(1).split("&").forEach(function(item) {
		var parts = item.split('=');
	    query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "")
	});

	VK.init(function() { });

	try {
		var photo = JSON.parse(query['api_result']).response[0]['photo_max_orig'];
		if (!(/^https?\:\/\/vk.com\//.test(photoURL))) photoURL = photo;
	} catch (_) { }

	avatar.css('background-image', 'url("' + photoURL + '")');
});