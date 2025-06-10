const brainteaserQuestion = document.getElementById('brainteaser-question');
const brainteaserAnswer = document.getElementById('brainteaser-answer');
const nextBtn = document.getElementById('next-btn');
const showAnswerBtn = document.getElementById('show-answer');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

const showLoading = () => {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    brainteaserQuestion.textContent = '加载中...';
    brainteaserAnswer.textContent = '加载中...';
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

const fetchBrainteaser = async () => {
    try {
        showLoading();
        const response = await fetch('./api/Brainteaser.php');
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || '服务器错误');
        }
        // 确保使用正确的字段名
        brainteaserQuestion.textContent = data.face;
        brainteaserAnswer.textContent = data.answer;
        brainteaserAnswer.classList.add('answer-hidden');
        errorMessage.classList.add('hidden');
    } catch (error) {
        console.error('Fetch error:', error);
        showError(`获取脑筋急转弯失败：${error.message}`);
        brainteaserQuestion.textContent = '加载失败';
        brainteaserAnswer.textContent = '请点击下一题重试';
    } finally {
        hideLoading();
    }
};

nextBtn.addEventListener('click', fetchBrainteaser);
showAnswerBtn.addEventListener('click', () => {
    brainteaserAnswer.classList.remove('answer-hidden');
    setTimeout(() => {
        brainteaserAnswer.classList.add('answer-hidden');
    }, 2000);
});

// 加载第一道脑筋急转弯
fetchBrainteaser();
