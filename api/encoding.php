<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 检查是否为POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// 获取POST数据
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

// 检查是否有文本输入
if (!isset($input['text']) || empty($input['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing text parameter']);
    exit;
}

$text = $input['text'];

// 执行编码转换
$result = [
    'gb2312' => convertToHex(mb_convert_encoding($text, 'GB2312', 'UTF-8')),
    'big5' => convertToHex(mb_convert_encoding($text, 'BIG5', 'UTF-8')),
    'gbk' => convertToHex(mb_convert_encoding($text, 'GBK', 'UTF-8')),
    'gb18030' => convertToHex(mb_convert_encoding($text, 'GB18030', 'UTF-8'))
];

// 返回JSON结果
echo json_encode($result);

// 将字符串转换为十六进制表示
function convertToHex($str) {
    $hex = '';
    for ($i = 0; $i < strlen($str); $i++) {
        $hex .= strtoupper(dechex(ord($str[$i])));
        if ($i < strlen($str) - 1) {
            $hex .= ' ';
        }
    }
    return $hex;
}
?>
    