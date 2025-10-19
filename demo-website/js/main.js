// 主要JavaScript文件
console.log('网站加载完成');

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成');
    
    // 添加导航点击效果
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('导航链接被点击:', this.textContent);
        });
    });
    
    // 添加页面滚动效果
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        console.log('页面滚动位置:', scrollTop);
    });
});

// 工具函数
function showMessage(message) {
    alert(message);
}

function formatDate(date) {
    return date.toLocaleDateString('zh-CN');
}
