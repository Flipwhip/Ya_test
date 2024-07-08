document.addEventListener('DOMContentLoaded', function () {

  // бегущая строка
  // создаем функию для бегущей строки
  function handleMarquee() {
    // выбираем блоки, куда вложен текст, который должен анимироваться
    const containers = document.querySelectorAll('.ticker__line');
    // проходим по всем дочерним элементам блока, клонируем их и вставляем в конец,
    // чтобы увеличить длинну бегущей строки
    containers.forEach((container) => {
      const children = Array.from(container.children);
      children.forEach((child) => {
        const clone = child.cloneNode(true);
        container.appendChild(clone);
      });
      // вычисляем сумму длинн всех дочерних элементов, для анимации
      const totalWidth = children.reduce((sum, child) => sum + child.offsetWidth, 0);
      // выставляем шаг анимации и переменную для контроля кадра анимации
      let progress = 0;
      let animationFrameId;

      // создаем функцию анимации
      function loop() {
        progress -= 1;
        if (progress === -totalWidth) {
          progress = 0;
        }
        container.style.transform = `translateX(${progress}px)`;
        animationFrameId = requestAnimationFrame(loop);
      }

      // функция старта анимации
      function startAnimation() {
        if (!animationFrameId) {
          loop();
        }
      }
      // функция остановки анимации
      function stopAnimation() {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null; // Сбрасываем состояние, чтобы не начать вызывать несколько циклов анимации
        }
      }
      // добавляем обработчики событий наведения мыши и отведения
      container.addEventListener('mouseover', stopAnimation);
      container.addEventListener('mouseout', startAnimation);

      // Добавляем обработчики для сворачивания страницы и потери фокуса
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          stopAnimation();
        } else {
          startAnimation();
        }
      });

      window.addEventListener('blur', stopAnimation);
      window.addEventListener('focus', startAnimation);

      startAnimation();
    });
  }

  handleMarquee();

  // плавный переход по якорям
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // слайдер в блоке Stages
  function handleSliderStages() {
    const sliderStages = document.querySelector('.stages__slider');
    const prevButtonStages = document.querySelector('.prev-btn');
    const nextButtonStages = document.querySelector('.next-btn');
    const slides = Array.from(sliderStages.querySelectorAll('li'));
    const bullets = document.querySelectorAll('.pagination-bullet');
    const slideCount = slides.length - 2;
    const swipeThreshold = 50; // Минимальное расстояние для срабатывания свайпа
    const mediaQuery = window.matchMedia('(max-width: 1365px)');
    let slideIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const initializeSlider = () => {
      if (mediaQuery.matches) {
        addEventListeners();
        handlePagination();
        slide(false);  // Применяем текущее значение slideIndex без анимации
      } else {
        removeEventListeners();
        resetSlider();
      }
    };

    const addEventListeners = () => {
      prevButtonStages.addEventListener('click', handlePrevClick);
      nextButtonStages.addEventListener('click', handleNextClick);
      sliderStages.addEventListener('touchstart', handleTouchStart);
      sliderStages.addEventListener('touchmove', handleTouchMove);
      sliderStages.addEventListener('touchend', handleTouchEnd);
    };

    const removeEventListeners = () => {
      prevButtonStages.removeEventListener('click', handlePrevClick);
      nextButtonStages.removeEventListener('click', handleNextClick);
      sliderStages.removeEventListener('touchstart', handleTouchStart);
      sliderStages.removeEventListener('touchmove', handleTouchMove);
      sliderStages.removeEventListener('touchend', handleTouchEnd);
    };

    const resetSlider = () => {
      sliderStages.style.transform = 'translateX(0)';
    };

    const handlePrevClick = () => {
      if (slideIndex > 0) {
        slideIndex--;
        slide();
      }
    };

    const handleNextClick = () => {
      if (slideIndex < slideCount - 1) {
        slideIndex++;
        slide();
      }
    };

    const slide = (animate = true) => {
      const imageWidth = sliderStages.clientWidth + 20;
      const slideOffset = -slideIndex * imageWidth;
      if (!animate) {
        sliderStages.style.transition = 'none';
      }

      sliderStages.style.transform = `translateX(${slideOffset}px)`;

      if (!animate) {
        sliderStages.offsetHeight; // Трюк для принудительной перерисовки
        sliderStages.style.transition = '';
      }

      updatePagination();
    };

    const updatePagination = () => {
      bullets.forEach((bullet, index) => {
        bullet.classList.toggle('pagination-bullet--active', index === slideIndex);
      });

      prevButtonStages.disabled = slideIndex === 0;
      nextButtonStages.disabled = slideIndex === slideCount - 1;
    };

    const handlePagination = () => {
      bullets.forEach((bullet, index) => {
        bullet.addEventListener('click', () => {
          slideIndex = index;
          slide();
        });
      });
    };

    const handleTouchStart = (event) => {
      startX = event.touches[0].clientX;
      isDragging = true;
      currentX = startX;
      sliderStages.style.transition = 'none';
    };

    const handleTouchMove = (event) => {
      if (isDragging) {
        currentX = event.touches[0].clientX;
        const deltaX = currentX - startX;
        const imageWidth = sliderStages.clientWidth + 20;

        const maxDeltaX = Math.min(Math.max(deltaX, -imageWidth - 20), imageWidth + 20);

        if ((slideIndex === 0 && maxDeltaX > 0) || (slideIndex === slideCount - 1 && maxDeltaX < 0)) {
          return;
        }

        const slideOffset = -slideIndex * imageWidth + maxDeltaX;
        sliderStages.style.transform = `translateX(${slideOffset}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        const deltaX = currentX - startX;
        const imageWidth = sliderStages.clientWidth + 20;

        if ((slideIndex === 0 && deltaX > 0) || (slideIndex === slideCount - 1 && deltaX < 0)) {
          slide();
        } else if (deltaX > swipeThreshold) {
          handlePrevClick();
        } else if (deltaX < -swipeThreshold) {
          handleNextClick();
        } else {
          slide();
        }

        isDragging = false;
        sliderStages.style.transition = '';
      }
    };

    initializeSlider();
    mediaQuery.addEventListener('change', initializeSlider);
  }

  handleSliderStages();


  // слайдер участников - блок Participants
  function handleSladerParticipants() {
    'use strict';

    var multiItemSlider = (function () {
      function _isElementVisible(element) {
        // Получаем координаты элемента на экране
        var rect = element.getBoundingClientRect(),
          vWidth = window.innerWidth,
          vHeight = window.innerHeight;

        // Проверяем, не находится ли элемент полностью вне экрана
        if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
          return false;
        }

        // Проверяем пересечение элемента с экраном
        var overlapX = Math.max(0, Math.min(rect.right, vWidth) - Math.max(rect.left, 0));
        var overlapY = Math.max(0, Math.min(rect.bottom, vHeight) - Math.max(rect.top, 0));

        // Возвращаем true, если элемент пересекается с экраном, иначе false
        return overlapX > 0 && overlapY > 0;
      }


      return function (selector, config) {
        var
          _mainElement = document.querySelector(selector), // Основной элемент блока
          _sliderWrapper = _mainElement.querySelector('.slider__wrapper'), // Обёртка для .slider__item
          _sliderItems = _mainElement.querySelectorAll('.slider__item'), // Элементы, которые перемещаются в слайдере
          _sliderControls = _mainElement.querySelectorAll('.slider__control'), // Элементы управления
          _sliderControlLeft = _mainElement.querySelector('.slider__control_left'), // Кнопка "LEFT"
          _sliderControlRight = _mainElement.querySelector('.slider__control_right'), // Кнопка "RIGHT"
          _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // Ширина обёртки
          _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width) + parseFloat(getComputedStyle(_sliderItems[0]).marginRight), // Ширина одного элемента включая маргин
          _html = _mainElement.innerHTML,
          _indexIndicator = 0,
          _indicatorItems,
          _positionLeftItem = 0,
          _transform = 0, // Текущее значение трансформации
          _items = [], // Массив элементов
          _interval = 0, // Интервал для автоматической прокрутки
          _startX = 0, // Начальная позиция X при касании
          _isSwiping = false, // Флаг, указывающий, происходит ли свайп
          _isMoving = false, // Флаг, указывающий, происходит ли движение
          _moveX = 0, // Текущее смещение по оси X
          _states = [
            { active: false, minWidth: 0, count: 1 },
            { active: false, minWidth: 1366, count: 3 },
          ],
          _config = {
            isCycling: false, // Автоматическая прокрутка
            direction: 'right', // Направление
            interval: 4000, // Интервал
            pause: true // Пауза при наведении
          };

        // Применение пользовательских настроек
        for (var key in config) {
          if (key in _config) {
            _config[key] = config[key];
          }
        }

        // Наполнение массива _items
        _sliderItems.forEach(function (item, index) {
          _items.push({ item: item, position: index, transform: 0 });
        });

        var _setActive = function () {
          var _index = 0;
          var width = parseFloat(document.body.clientWidth);

          _states.forEach(function (item, index, arr) {
            _states[index].active = false;
            if (width >= _states[index].minWidth)
              _index = index;
          });

          _states[_index].active = true;
          _resetPosition();
        }

        var _getActive = function () {
          var _index;
          _states.forEach(function (item, index, arr) {
            if (_states[index].active) {
              _index = index;
            }
          });
          return _index;
        }

        var position = {
          getItemMin: function () {
            var indexItem = 0;
            _items.forEach(function (item, index) {
              if (item.position < _items[indexItem].position) {
                indexItem = index;
              }
            });
            return indexItem;
          },

          getItemMax: function () {
            var indexItem = 0;
            _items.forEach(function (item, index) {
              if (item.position > _items[indexItem].position) {
                indexItem = index;
              }
            });
            return indexItem;
          },

          getMin: function () {
            return _items[position.getItemMin()].position;
          },

          getMax: function () {
            return _items[position.getItemMax()].position;
          }
        }

        var _transformItem = function (direction) {
          var nextItem;

          // Проверяет, виден ли основной элемент (слайдер)
          if (!_isElementVisible(_mainElement)) {
            return;
          }

          if (direction === 'right') { // Если направление движения вправо
            _positionLeftItem++; // Увеличивает левую позицию элемента на 1

            // Проверяет, вышел ли крайний правый элемент за пределы видимости

            nextItem = position.getItemMin(); // Получает индекс минимального элемента
            _items[nextItem].position = position.getMax() + 1; // Устанавливает его позицию за пределами правого края
            _items[nextItem].transform += _items.length * _itemWidth; // Увеличивает трансформацию для его перемещения
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + 'px)'; // Применяет трансформацию


            _transform -= _itemWidth; // Уменьшает общую трансформацию на ширину элемента
            _indexIndicator = (_indexIndicator + 1) % _sliderItems.length; // Обновляет индикатор текущего элемента
          }

          if (direction === 'left') { // Если направление движения влево
            _positionLeftItem--; // Уменьшает левую позицию элемента на 1
            nextItem = position.getItemMax(); // Получает индекс максимального элемента
            _items[nextItem].position = position.getMin() - 1; // Устанавливает его позицию за пределами левого края
            _items[nextItem].transform -= _items.length * _itemWidth; // Уменьшает трансформацию для его перемещения
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + 'px)'; // Применяет трансформацию
            _transform += _itemWidth; // Увеличивает общую трансформацию на ширину элемента
            _indexIndicator = (_indexIndicator - 1 + _sliderItems.length) % _sliderItems.length; // Обновляет индикатор текущего элемента
          }

          // Проверяет, если левая позиция элемента превысила максимум, устанавливает минимальную позицию
          if (_positionLeftItem > position.getMax()) {
            _positionLeftItem = position.getMin(); // Устанавливает минимальную позицию
            _transform = -_positionLeftItem * _itemWidth; // Пересчитывает трансформацию
          } else if (_positionLeftItem < position.getMin()) { // Проверяет, если левая позиция элемента меньше минимума
            _positionLeftItem = position.getMax(); // Устанавливает максимальную позицию
            _transform = -_positionLeftItem * _itemWidth; // Пересчитывает трансформацию
          }

          _sliderWrapper.style.transition = 'transform 0.5s ease'; // Устанавливает плавный переход для трансформации
          _sliderWrapper.style.transform = 'translateX(' + _transform + 'px)'; // Применяет общую трансформацию к обертке слайдера
          _indicatorItems.textContent = _indexIndicator + 1; // Обновляет индикатор текущего элемента
        };



        var _refreshItems = function () {
          _sliderItems.forEach(function (item, index) {
            _items.push({ item: item, position: index, transform: 0 });
          });

          // Перемещение крайнего элемента вперёд
          if (_items.length > 0) {
            var firstItem = _items[0];
            firstItem.position = position.getMax() + 1;
            firstItem.transform += _items.length * _itemWidth;
            firstItem.item.style.transform = 'translateX(' + firstItem.transform + 'px)';
          }

          // Перемещение последнего элемента в начало
          if (_items.length > 0) {
            var lastItem = _items[_items.length - 1];
            lastItem.position = position.getMin() - 1;
            lastItem.transform -= _items.length * _itemWidth;
            lastItem.item.style.transform = 'translateX(' + lastItem.transform + 'px)';
          }
        };

        var _resetPosition = function () {
          var lastItem = _items[_items.length - 1];
          lastItem.position = position.getMin() - 1;
          lastItem.transform = -_items.length * _itemWidth;
          lastItem.item.style.transform = 'translateX(' + lastItem.transform + 'px)';
        };

        var _cycle = function (direction) {
          if (!_config.isCycling) {
            return;
          }


          _interval = setInterval(function () {
            _transformItem(direction);
          }, _config.interval);
        }

        var _controlClick = function (e) {
          if (e.target.classList.contains('slider__control')) {
            e.preventDefault();
            var direction = e.target.classList.contains('slider__control_right') ? 'right' : 'left';
            if (e.target.classList.contains('slider__control_right')) {
            }
            _transformItem(direction);
            clearInterval(_interval);
            _cycle(_config.direction);
            _indicatorItems.textContent = _indexIndicator + 1;
          }
        };

        var _handleVisibilityChange = function () {
          if (document.visibilityState === "hidden" || document.hidden) {
            clearInterval(_interval);
          } else {
            clearInterval(_interval);
            _cycle(_config.direction);
          }
        }

        var _handleResize = function () {
          var _index = 0,
            width = parseFloat(document.body.clientWidth);

          _states.forEach(function (item, index, arr) {
            if (width >= _states[index].minWidth)
              _index = index;
          });

          if (_index !== _getActive()) {
            _setActive();
            _refresh();
          } else {
            _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
            _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width) + parseFloat(getComputedStyle(_sliderItems[0]).marginRight);
            _refreshItems(); // Обновление элементов после пересчета ширины
          }
        };

        var _handleWindowBlur = function () {
          clearInterval(_interval);
        };

        var _handleWindowFocus = function () {
          if (_config.isCycling) {
            clearInterval(_interval);
            _cycle(_config.direction);
          }
        };

        function _refreshSlider() {
          var width = parseFloat(document.body.clientWidth);

          // Пересчитываем активное состояние и обновляем параметры
          _states.forEach(function (item, index, arr) {
            if (width >= item.minWidth) {
              _index = index;
            }
          });

          if (_index !== _getActive()) {
            _setActive(); // Устанавливаем активное состояние
            _refresh(); // Обновляем слайдер после изменения состояния
          }
          _refreshItems();
        }

        var _refresh = function () {
          clearInterval(_interval);

          _mainElement.innerHTML = _html;

          _sliderWrapper = _mainElement.querySelector('.slider__wrapper');
          _sliderItems = _mainElement.querySelectorAll('.slider__item');
          _sliderControls = _mainElement.querySelectorAll('.slider__control');
          _sliderControlLeft = _mainElement.querySelector('.slider__control_left');
          _sliderControlRight = _mainElement.querySelector('.slider__control_right');

          _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
          _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width) + parseFloat(getComputedStyle(_sliderItems[0]).marginRight);

          _positionLeftItem = 0;
          _transform = 0;
          _indexIndicator = 0;

          _items = [];

          _sliderItems.forEach(function (item, index) {
            _items.push({ item: item, position: index, transform: 0 });
          });

          _resetPosition();
          _addIndicators();

        }

        var _setUpListeners = function () {
          _mainElement.addEventListener('click', _controlClick);

          // Если включена опция паузы при наведении и автоматическая прокрутка слайдов, добавление обработчиков событий для остановки и возобновления автоматической прокрутки при наведении мыши на слайдер и уходе с него
          if (_config.pause && _config.isCycling) {
            _mainElement.addEventListener('mouseenter', function () {
              clearInterval(_interval); // Остановка автоматической прокрутки слайдов при наведении мыши
            });
            _mainElement.addEventListener('mouseleave', function () {
              clearInterval(_interval); // Остановка текущего интервала автоматической прокрутки слайдов
              _cycle(_config.direction); // Запуск автоматической прокрутки слайдов с заданным направлением
            });
          }
          _mainElement.addEventListener('touchstart', onTouchStart);
          _mainElement.addEventListener('touchmove', onTouchMove);
          _mainElement.addEventListener('touchend', onSwipeEnd);

          function onTouchStart(e) {
            _startX = e.touches[0].clientX;
            _isSwiping = true;
            _isMoving = false;
            clearInterval(_interval);
          }

          function onTouchMove(e) {
            if (!_isSwiping) return;

            var _endX = e.touches[0].clientX;
            _moveX = _endX - _startX;

            // Ограничиваем смещение, чтобы оно не превышало ширину элемента
            if (Math.abs(_moveX) > _itemWidth + 32) {
              _moveX = _moveX < 0 ? -_itemWidth - 32 : _itemWidth + 32;
            }

            _isMoving = Math.abs(_moveX) > 100;

            _sliderWrapper.style.transition = 'transform 0s';
            _sliderWrapper.style.transform = 'translateX(' + (_transform + _moveX) + 'px)';
          }

          function onSwipeEnd(e) {
            _isSwiping = false;

            if (_isMoving) {
              if (_moveX < 0) {
                _transformItem('right');
              } else {
                _transformItem('left');
              }
            } else {
              _sliderWrapper.style.transition = 'transform 0.5s';
              _sliderWrapper.style.transform = 'translateX(' + _transform + 'px)';
            }
            _cycle(_config.direction);
          }

          document.addEventListener('visibilitychange', _handleVisibilityChange, false);
          window.addEventListener('blur', _handleWindowBlur);
          window.addEventListener('focus', _handleWindowFocus);
          window.addEventListener('resize', function () {
            var _index = 0,
              width = parseFloat(document.body.clientWidth);

            _states.forEach(function (item, index, arr) {
              if (width >= _states[index].minWidth)
                _index = index;
            });

            if (_index !== _getActive()) {
              _setActive();
              _refresh();
            }
          });


          window.addEventListener('orientationchange', function () {
            var _index = 0,
              width = parseFloat(document.body.clientWidth);

            _states.forEach(function (item, index, arr) {
              if (width >= _states[index].minWidth)
                _index = index;
            });

            if (_index !== _getActive()) {
              _setActive();
              _refresh();
            }
          });
        }

        var _addIndicators = function () {
          _setActive();
          var activeState = _states.find(state => state.active);
          _indexIndicator = activeState.count - 1;
          var sliderIndicator = document.querySelector('.slider__indicator');
          sliderIndicator.textContent = activeState.count;
          _indicatorItems = sliderIndicator;
          var totalItemsIndicator = document.querySelector('.slider__indicator_all');
          totalItemsIndicator.textContent = _sliderItems.length;
        }

        _addIndicators();
        _setUpListeners();

        if (document.visibilityState === "visible") {
          _cycle(_config.direction);
        }

        _setActive();

        return {

          right: function () {
            _transformItem('right');
          },

          left: function () {
            _transformItem('left');
          },

          stop: function () {
            _config.isCycling = false;
            clearInterval(_interval);
          },

          cycle: function () {
            _config.isCycling = true;
            clearInterval(_interval);
            _cycle(_config.direction);
          }
        }
      }
    }());

    var slider = multiItemSlider('.slider', {
      isCycling: true
    });
  }

  handleSladerParticipants();

});

