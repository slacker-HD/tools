const riddleFace = document.getElementById('riddle-face');
const riddleAnswer = document.getElementById('riddle-answer');
const nextBtn = document.getElementById('next-btn');
const showAnswerBtn = document.getElementById('show-answer');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

const showLoading = () => {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    riddleFace.textContent = '加载中...';
    riddleAnswer.textContent = '加载中...';
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50');
};

const hideLoading = () => {
    loading.classList.add('hidden');
    nextBtn.disabled = false;
    nextBtn.classList.remove('opacity-50');
};

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
};

const fetchRiddle = async () => {
    try {
        showLoading();
        const response = await fetch('./api/Riddle.php');
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || '服务器错误');
        }
        riddleFace.textContent = data.face;
        riddleAnswer.textContent = data.answer;
        riddleAnswer.classList.add('answer-hidden');
        errorMessage.classList.add('hidden');
    } catch (error) {
        console.error('Fetch error:', error);
        showError(`获取谜语失败：${error.message}`);
        riddleFace.textContent = '加载失败';
        riddleAnswer.textContent = '请点击下一题重试';
    } finally {
        hideLoading();
    }
};

nextBtn.addEventListener('click', fetchRiddle);
showAnswerBtn.addEventListener('click', () => {
    riddleAnswer.classList.remove('answer-hidden');
    setTimeout(() => {
        riddleAnswer.classList.add('answer-hidden');
    }, 2000);
});

// 加载第一道谜语
fetchRiddle();
