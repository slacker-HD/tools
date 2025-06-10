<?php
// 获取当前月份和日期
$month = date('m', time());
$day = date('d', time());

// 构建百度百科 API 的 URL
$url = "https://baike.baidu.com/cms/home/eventsOnHistory/{$month}.json";

// 获取 API 数据
$data = file_get_contents($url);
$data2 = json_decode($data, true);

// 初始化事件数组
$array = [];

// 检查数据是否包含所需的事件信息
if (isset($data2[$month][$month.$day])) {
    foreach ($data2[$month][$month.$day] as $data) {
        $array[] = [
            'year' => $data['year'],
            'title' => $data['title']
        ];
    }
}

// 构建最终的 JSON 输出
$json_output = [
    "{$month}{$day}" => $array
];

// 设置响应头为 JSON 格式
header('Content-type: application/json');

// 输出 JSON 数据
echo json_encode($json_output, JSON_UNESCAPED_UNICODE);
?>
