// Простая кнопка наверх с PNG иконкой
class ScrollToTopButton {
  constructor() {
    this.button = null;
    this.init();
  }

  init() {
    // Создаем кнопку
    if (!document.querySelector('.scroll-to-top')) {
      this.createButton();
    }
    
    this.button = document.querySelector('.scroll-to-top');
    
    if (!this.button) return;
    
    // Слушатели
    window.addEventListener('scroll', () => this.handleScroll());
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  createButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    button.innerHTML = '<img src="./assets/img/jokey.png" alt="Scroll to top">';
    
    document.body.appendChild(button);
  }

  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Показываем кнопку если скролл больше 300px
    if (scrollTop > 300) {
      this.button.classList.add('is-visible');
    } else {
      this.button.classList.remove('is-visible');
    }
  }

  scrollToTop() {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Инициализируем когда DOM готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ScrollToTopButton();
  });
} else {
  new ScrollToTopButton();
}