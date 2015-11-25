<?php
	$secret = 'tJ3TAdXwp005GmOHTtiu';

	$viewer_id = param('viewer_id');
	$auth_key = param('auth_key');
	$api_id = param('api_id');
	$url = param('url');
	if ($auth_key == md5(implode('_', [$api_id, $viewer_id, $secret])) && preg_match('#^https?\://[a-zA-Z0-9]+\.vk\.com/.*#', $url)) {
		$pic = param('img');
		$path = __DIR__ . '/pics/' . intval($viewer_id) . '.png';
		@file_put_contents($path, base64_decode($pic));
		
		$curl = curl_init();
		curl_setopt_array($curl, [
			CURLOPT_URL => $url,
			CURLOPT_HEADER => false,
			CURLOPT_POST => true,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false,
			CURLOPT_POSTFIELDS => [
				'photo' => new CurlFile($path, 'image/png')
			],
			CURLOPT_RETURNTRANSFER => true,
		]);
		$response = @json_decode(curl_exec($curl));
		curl_close($curl);
		send(['response' => $response]);
	} else
		send(['error' => 'gtfo']);
	
	function send($data) {
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: X-Requested-With');
		header('Content-type: application/json');
		echo json_encode($data);
		die();
	}

	function param($key) {
		return array_key_exists($key, $_POST) && is_scalar($_POST[$key]) ? $_POST[$key] : null;
	}