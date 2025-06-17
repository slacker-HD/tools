<?php
header('Content-Type: application/json;charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $conn = mysqli_connect("qdm723417486.my3w.com:3306", "qdm723417486", "Xiao1Ban", "qdm723417486_db");
    
    if (!$conn) {
        throw new Exception("数据库连接失败: " . mysqli_connect_error());
    }

    if (!mysqli_set_charset($conn, "utf8")) {
        throw new Exception("设置字符集失败: " . mysqli_error($conn));
    }

    $sql = "SELECT Content FROM Feihua ORDER BY RAND() LIMIT 1";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        throw new Exception("查询失败: " . mysqli_error($conn));
    }

    $row = mysqli_fetch_assoc($result);
    if (!$row) {
        throw new Exception("未找到数据");
    }

    echo json_encode([
        'success' => true,
        'quote' => $row['Content']
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Feihua API Error: " . $e->getMessage());
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'host' => "qdm723417486.my3w.com:3306",
            'user' => "qdm723417486",
            'db' => "qdm723417486_db"
        ]
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}