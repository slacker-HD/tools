<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

// 获取前端传入城市名
$city = isset($_GET['city']) ? trim($_GET['city']) : "合肥";
$cityEncode = urlencode($city);
$apiUrl = "https://wttr.in/{$cityEncode}?format=j1&lang=zh";

// PHP服务端发起请求，不受浏览器跨域限制
$opts = [
    'http' => [
        'timeout' => 10,
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/88.0.4324.181'
    ]
];
$context = stream_context_create($opts);
$resp = @file_get_contents($apiUrl, false, $context);

if (!$resp) {
    echo json_encode([
        "error" => "天气接口请求失败",
        "current_condition" => [[
            "temp_C" => "--",
            "FeelsLikeC" => "--",
            "humidity" => "--",
            "windspeedKmph" => "--",
            "weatherCode" => ""
        ]]
    ]);
    exit;
}

// 直接返回原始天气JSON给前端
echo $resp;
exit;
?>