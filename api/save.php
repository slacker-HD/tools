<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$content = $input['content'] ?? '';
$encoding = $input['encoding'] ?? 'UTF-8';
$lineEnding = $input['lineEnding'] ?? 'LF';
$fileName = $input['fileName'] ?? 'output.txt';

// 处理换行符
$content = str_replace("\n", $lineEnding === 'CRLF' ? "\r\n" : "\n", $content);

// 处理编码转换
switch ($encoding) {
    case 'GB2312':
        $content = iconv('UTF-8', 'GB2312//IGNORE', $content);
        break;
    case 'GBK':
        $content = iconv('UTF-8', 'GBK//IGNORE', $content);
        break;
    case 'GB18030':
        $content = iconv('UTF-8', 'GB18030//IGNORE', $content);
        break;
    case 'BIG5':
        $content = iconv('UTF-8', 'BIG5//IGNORE', $content);
        break;
    case 'UTF-16LE':
        $content = "\xFF\xFE" . iconv('UTF-8', 'UTF-16LE', $content);
        break;
    case 'UTF-16BE':
        $content = "\xFE\xFF" . iconv('UTF-8', 'UTF-16BE', $content);
        break;
    case 'UTF-8-BOM':
        $content = "\xEF\xBB\xBF" . $content;
        break;
}

// 设置响应头
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . strlen($content));

// 输出内容
echo $content;
