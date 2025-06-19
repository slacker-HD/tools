<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理CORS预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 错误处理
function returnError($message) {
    die(json_encode(['error' => $message]));
}

// 获取请求数据
$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// FTP连接处理
function connectFTP($host, $username, $password, $port = 21) {
    $conn = ftp_connect($host, $port);
    if (!$conn) {
        returnError('无法连接到FTP服务器');
    }
    
    if (!ftp_login($conn, $username, $password)) {
        returnError('登录失败');
    }
    
    ftp_pasv($conn, true); // 使用被动模式
    return $conn;
}

// 根据action处理不同的FTP操作
switch($action) {
    case 'connect':
        $conn = connectFTP($data['host'], $data['username'], $data['password'], $data['port']);
        if ($conn) {
            echo json_encode(['success' => true]);
        }
        break;

    case 'list':
        $conn = connectFTP($data['host'], $data['username'], $data['password'], $data['port']);
        $path = $data['path'] ?? '/';
        $rawList = ftp_rawlist($conn, $path);
        $files = [];
        foreach ($rawList as $item) {
            $parts = preg_split('/\s+/', $item, 9);
            $isDir = $parts[0][0] === 'd';
            $name = $parts[8];
            $files[] = [
                'name' => $name,
                'isDir' => $isDir
            ];
        }
        echo json_encode(['files' => $files]);
        break;

    case 'upload':
        $conn = connectFTP($data['host'], $data['username'], $data['password'], $data['port']);
        if (!isset($_FILES['file'])) {
            returnError('没有上传文件');
        }
        $remotePath = $data['path'] . '/' . $_FILES['file']['name'];
        if (ftp_put($conn, $remotePath, $_FILES['file']['tmp_name'], FTP_BINARY)) {
            echo json_encode(['success' => true]);
        } else {
            returnError('上传失败');
        }
        break;

    case 'mkdir':
        $conn = connectFTP($data['host'], $data['username'], $data['password'], $data['port']);
        $path = $data['path'];
        if (ftp_mkdir($conn, $path)) {
            echo json_encode(['success' => true]);
        } else {
            returnError('创建目录失败');
        }
        break;

    case 'download':
        $conn = connectFTP($data['host'], $data['username'], $data['password'], $data['port']);
        $path = $data['path'];
        
        // 创建临时文件
        $tempFile = tempnam(sys_get_temp_dir(), 'ftp_');
        
        if (ftp_get($conn, $tempFile, $path, FTP_BINARY)) {
            // 设置响应头
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . basename($path) . '"');
            header('Content-Length: ' . filesize($tempFile));
            
            // 输出文件内容
            readfile($tempFile);
            unlink($tempFile); // 删除临时文件
            exit;
        } else {
            returnError('下载失败');
        }
        break;

    default:
        returnError('未知操作');
}

// 关闭连接
if (isset($conn)) {
    ftp_close($conn);
}