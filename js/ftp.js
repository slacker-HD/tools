class FTPClient {
    constructor() {
        this.currentPath = '/';
        this.connectionInfo = null;
        this.bindEvents();
        this.isConnected = false;
    }

    bindEvents() {
        // 连接按钮
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
    }

    async connect() {
        const host = document.getElementById('host').value;
        const port = document.getElementById('port').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!host || !username || !password) {
            this.showError('请填写完整的连接信息');
            return;
        }

        try {
            const response = await fetch('/api/ftp.php?action=connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, port, username, password })
            });

            const data = await response.json();
            if (data.success) {
                this.connectionInfo = { host, port, username, password };
                this.isConnected = true;
                this.listFiles();
                this.showSuccess('连接成功');
            } else {
                this.showError(data.error || '连接失败');
            }
        } catch (err) {
            this.showError('连接服务器失败');
        }
    }

    async listFiles() {
        if (!this.isConnected) return;

        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>加载中...</div>';

        try {
            const response = await fetch('/api/ftp.php?action=list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...this.connectionInfo,
                    path: this.currentPath
                })
            });

            const data = await response.json();
            this.updateFileList(data.files || []);
        } catch (err) {
            this.showError('获取文件列表失败');
        }
    }

    updateFileList(files) {
        const fileList = document.getElementById('fileList');
        const template = document.getElementById('file-item-template');
        if (!template) {
            this.showError('未找到文件项模板元素');
            return;
        }
        fileList.innerHTML = '';

        files.forEach(file => {
            const clone = template.content.cloneNode(true);
            const filename = clone.querySelector('.filename');
            filename.textContent = file;

            // 为下载按钮添加事件监听
            const downloadBtn = clone.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => this.downloadFile(file));

            fileList.appendChild(clone);
        });
    }

    showSuccess(message) {
        // 可以使用更漂亮的通知组件
        alert(message);
    }

    showError(message) {
        // 可以使用更漂亮的通知组件
        alert('错误: ' + message);
    }

    async downloadFile(fileName) {
        if (!this.connectionInfo) return;
        
        try {
            const response = await fetch('/api/ftp.php?action=download', {
                method: 'POST',
                body: JSON.stringify({
                    ...this.connectionInfo,
                    path: `${this.currentPath}/${fileName}`
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // 获取文件内容并触发下载
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('下载失败：' + error.message);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.ftpClient = new FTPClient();
});