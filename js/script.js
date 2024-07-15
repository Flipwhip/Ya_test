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
  // Находим все элементы <a>, у которых атрибут href начинается с символа '#'
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Для каждого найденного элемента добавляем обработчик события 'click'
    anchor.addEventListener('click', function (e) {
      // Предотвращаем стандартное поведение ссылки (переход по якорю)
      e.preventDefault();

      // Получаем элемент, на который ссылается якорь
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { // Если такой элемент существует на странице
        // Скроллим к этому элементу с анимацией плавного перехода
        target.scrollIntoView({
          behavior: 'smooth' // Указываем, что скроллинг должен быть плавным
        });
      }
    });
  });

   // слайдер в блоке Stages
  function handleSliderStages() {
    // Находим элементы слайдера и кнопок навигации
    const sliderStages = document.querySelector('.stages__slider');
    const prevButtonStages = document.querySelector('.prev-btn');
    const nextButtonStages = document.querySelector('.next-btn');
    // Получаем все слайды как массив элементов
    const slides = Array.from(sliderStages.querySelectorAll('li'));
    // Получаем элементы пагинации (точки)
    const bullets = document.querySelectorAll('.pagination-bullet');
    // Количество слайдов, минус два (первый и последний - клонированные)
    const slideCount = slides.length - 2;
    // Порог расстояния для распознавания свайпа
    const swipeThreshold = 50;
    // Медиа-запрос для отслеживания ширины экрана
    const mediaQuery = window.matchMedia('(max-width: 1365px)');
    // Индекс текущего слайда
    let slideIndex = 0;
    // Координаты начала и текущего положения пальца при свайпе
    let startX = 0;
    let currentX = 0;
    // Флаг для отслеживания состояния перетаскивания
    let isDragging = false;

    // Функция инициализации слайдера
    const initializeSlider = () => {
      if (mediaQuery.matches) {
        // Если ширина экрана меньше 1365px, добавляем обработчики событий
        addEventListeners();
        handlePagination();
        // Перемещаем слайдер без анимации на текущий индекс
        slide(false);
      } else {
        // Если ширина экрана больше 1365px, удаляем обработчики событий и сбрасываем слайдер
        removeEventListeners();
        resetSlider();
      }
    };

    // Функция добавления обработчиков событий
    const addEventListeners = () => {
      prevButtonStages.addEventListener('click', handlePrevClick);
      nextButtonStages.addEventListener('click', handleNextClick);
      sliderStages.addEventListener('touchstart', handleTouchStart);
      sliderStages.addEventListener('touchmove', handleTouchMove);
      sliderStages.addEventListener('touchend', handleTouchEnd);
    };

    // Функция удаления обработчиков событий
    const removeEventListeners = () => {
      prevButtonStages.removeEventListener('click', handlePrevClick);
      nextButtonStages.removeEventListener('click', handleNextClick);
      sliderStages.removeEventListener('touchstart', handleTouchStart);
      sliderStages.removeEventListener('touchmove', handleTouchMove);
      sliderStages.removeEventListener('touchend', handleTouchEnd);
    };

    // Функция сброса слайдера в начальное состояние
    const resetSlider = () => {
      sliderStages.style.transform = 'translateX(0)';
    };

    // Обработчик клика по кнопке "предыдущий слайд"
    const handlePrevClick = () => {
      if (slideIndex > 0) {
        slideIndex--;
        slide();
      }
    };

    // Обработчик клика по кнопке "следующий слайд"
    const handleNextClick = () => {
      if (slideIndex < slideCount - 1) {
        slideIndex++;
        slide();
      }
    };

    // Функция перемещения слайдера
    const slide = (animate = true) => {
      // Ширина изображения плюс отступ
      const imageWidth = sliderStages.clientWidth + 20;
      // Смещение слайдера
      const slideOffset = -slideIndex * imageWidth;
      if (!animate) {
        // Отключаем анимацию
        sliderStages.style.transition = 'none';
      }

      // Применяем смещение к слайдеру
      sliderStages.style.transform = `translateX(${slideOffset}px)`;

      if (!animate) {
        // Принудительная перерисовка для применения изменений
        sliderStages.offsetHeight;
        // Восстанавливаем анимацию
        sliderStages.style.transition = '';
      }

      // Обновляем состояние пагинации
      updatePagination();
    };

    // Функция обновления состояния пагинации
    const updatePagination = () => {
      bullets.forEach((bullet, index) => {
        bullet.classList.toggle('pagination-bullet--active', index === slideIndex);
      });

      // Деактивируем кнопки, если достигли конца или начала
      prevButtonStages.disabled = slideIndex === 0;
      nextButtonStages.disabled = slideIndex === slideCount - 1;
    };

    // Функция обработки кликов по точкам пагинации
    const handlePagination = () => {
      bullets.forEach((bullet, index) => {
        bullet.addEventListener('click', () => {
          slideIndex = index;
          slide();
        });
      });
    };

    // Обработчик начала свайпа
    const handleTouchStart = (event) => {
      startX = event.touches[0].clientX;
      isDragging = true;
      currentX = startX;
      sliderStages.style.transition = 'none';
    };

    // Обработчик движения пальца при свайпе
    const handleTouchMove = (event) => {
      if (isDragging) {
        currentX = event.touches[0].clientX;
        const deltaX = currentX - startX;
        const imageWidth = sliderStages.clientWidth + 20;

        // Ограничение движения в пределах одного слайда
        const maxDeltaX = Math.min(Math.max(deltaX, -imageWidth - 20), imageWidth + 20);

        // Если находимся на первом или последнем слайде, ограничиваем движение
        if ((slideIndex === 0 && maxDeltaX > 0) || (slideIndex === slideCount - 1 && maxDeltaX < 0)) {
          return;
        }

        // Смещение слайдера
        const slideOffset = -slideIndex * imageWidth + maxDeltaX;
        sliderStages.style.transform = `translateX(${slideOffset}px)`;
      }
    };

    // Обработчик окончания свайпа
    const handleTouchEnd = () => {
      if (isDragging) {
        const deltaX = currentX - startX;
        const imageWidth = sliderStages.clientWidth + 20;

        if ((slideIndex === 0 && deltaX > 0) || (slideIndex === slideCount - 1 && deltaX < 0)) {
          // Если находимся на первом или последнем слайде и пытались свайпнуть за пределы, возвращаем слайдер
          slide();
        } else if (deltaX > swipeThreshold) {
          // Если свайп был достаточно длинным влево, переключаемся на предыдущий слайд
          handlePrevClick();
        } else if (deltaX < -swipeThreshold) {
          // Если свайп был достаточно длинным вправо, переключаемся на следующий слайд
          handleNextClick();
        } else {
          // Если свайп был недостаточно длинным, возвращаем слайдер
          slide();
        }

        isDragging = false;
        sliderStages.style.transition = '';
      }
    };

    // Инициализируем слайдер при загрузке скрипта
    initializeSlider();
    // Добавляем обработчик для изменения медиазапроса
    mediaQuery.addEventListener('change', initializeSlider);
  }

  // Вызываем функцию инициализации слайдера
  handleSliderStages();
 
  // слайдер участников - блок Participants
  function handleSladerParticipants() {
    'use strict'; // Использование строгого режима для обеспечения более строгого выполнения кода

    var multiItemSlider = (function () {
      function _isElementVisible(element) {
        // Получаем координаты элемента на экране и высчитываем виден ли элеменьт относитель 
        //начала координат - верхнего левого угла экрана
        var rect = element.getBoundingClientRect(),
          vWidth = window.innerWidth, // Ширина окна браузера
          vHeight = window.innerHeight; // Высота окна браузера

        // Проверяем, не находится ли элемент полностью вне экрана
        if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
          return false;
        }

        // Проверяем пересечение элемента с экраном
        var overlapX = Math.max(0, Math.min(rect.right, vWidth) - Math.max(rect.left, 0)); // Вычисляем пересечение элемента с экраном по горизонтали, либо 0 либо пересекается
        var overlapY = Math.max(0, Math.min(rect.bottom, vHeight) - Math.max(rect.top, 0)); // Вычисляем пересечение элемента с экраном по вертикали

        // Возвращаем true, если элемент пересекается с экраном, иначе false
        return overlapX > 0 && overlapY > 0;
      }

      return function (selector, config) {// Возвращаем функцию, создающую слайдер
        var
          _mainElement = document.querySelector(selector), // Основной элемент блока
          _sliderWrapper = _mainElement.querySelector('.slider__wrapper'), // Обёртка для слайдов (.slider__item)
          _sliderItems = _mainElement.querySelectorAll('.slider__item'), // Элементы, которые перемещаются в слайдере
          _sliderControls = _mainElement.querySelectorAll('.slider__control'), // Элементы управления
          _sliderControlLeft = _mainElement.querySelector('.slider__control_left'), // Кнопка "LEFT"
          _sliderControlRight = _mainElement.querySelector('.slider__control_right'), // Кнопка "RIGHT"
          _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // Ширина обёртки
          _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width) + parseFloat(getComputedStyle(_sliderItems[0]).marginRight), // Ширина одного элемента включая маргин
          _html = _mainElement.innerHTML, // Сохраняем HTML - разметку с содержимым основного элемента
          _indexIndicator = 0,  // Индикатор текущего слайда
          _indicatorItems, // Элемент для отображения текущего слайда
          _positionLeftItem = 0, // Позиция первого видимого элемента
          _transform = 0, // Текущее значение трансформации
          _items = [], // Массив элементов
          _interval = 0, // Интервал для автоматической прокрутки
          _startX = 0, // Начальная позиция X при касании
          _isSwiping = false, // Флаг, указывающий, происходит ли свайп
          _isMoving = false, // Флаг, указывающий, происходит ли движение
          _moveX = 0, // Текущее смещение по оси X
          _states = [ // Настройки для разных ширин экрана
            { active: false, minWidth: 0, count: 1 }, // Один элемент на малых экранах
            { active: false, minWidth: 1366, count: 3 }, // Три элемента на больших экранах
          ],
          _config = { // Настройки по умолчанию
            isCycling: false, // Автоматическая прокрутка
            direction: 'right', // Направление
            interval: 4000, // Интервал
            pause: true // Пауза при наведении
          };

        // Применение пользовательских настроек, при вызове функции со своими настройками, главное чтобы свойство было в _config
        for (var key in config) {
          if (key in _config) {
            _config[key] = config[key];
          }
        }

        // Наполнение массива _items объектами слайдов с 3мя свойствами
        _sliderItems.forEach(function (item, index) {
          _items.push({ item: item, position: index, transform: 0 }); // Добавление каждого слайда в массив _items
        });

        var _setActive = function () { // Функция для установки активного состояния из массива _states по ширине экрана
          var _index = 0;
          var width = parseFloat(document.body.clientWidth); // Получаем ширину окна

          _states.forEach(function (item, index) { // Обновляем состояние активных элементов в зависимости от ширины экрана
            _states[index].active = false;
            if (width >= _states[index].minWidth)
              _index = index;
          });

          _states[_index].active = true;
          _resetPosition(); // функция для установки последнего слайда перед первым и пересчет трансформации его, в зависимиости от ширины экрана
        }

        var _getActive = function () { // Функция для получения активного состояния, предназначена для поиска и возвращения индекса активного состояния из массива _states.
          var _index;
          _states.forEach(function (item, index) {
            if (_states[index].active) {
              _index = index;
            }
          });
          return _index; // возвращаем индекс активного состояния
        }

        var position = { // Метод для получения индекса элемента с минимальной позицей
          getItemMin: function () { // Получение минимальной позиции
            var indexItem = 0; // Инициализация индекса для минимального элемента
            _items.forEach(function (item, index) { // Перебор всех элементов слайдера
              if (item.position < _items[indexItem].position) { // Если текущая позиция элемента меньше позиции минимального элемента
                indexItem = index; // Обновление индекса минимального элемента
              }
            });
            return indexItem; // Возвращение индекса элемента с минимальной позицией
          },

          // Метод для получения индекса элемента с максимальной позицией
          getItemMax: function () {
            var indexItem = 0; // Инициализация индекса для максимального элемента
            _items.forEach(function (item, index) { // Перебор всех элементов слайдера
              if (item.position > _items[indexItem].position) { // Если текущая позиция элемента больше позиции максимального элемента
                indexItem = index; // Обновление индекса максимального элемента
              }
            });
            return indexItem; // Возвращение индекса элемента с максимальной позицией
          },

          // Метод для получения минимальной позиции среди всех элементов
          getMin: function () {
            return _items[position.getItemMin()].position; // Возвращение минимальной позиции, вызвав метод getItemMin для получения индекса элемента с минимальной позицией
          },

          // Метод для получения максимальной позиции среди всех элементов
          getMax: function () {
            return _items[position.getItemMax()].position; // Возвращение максимальной позиции, вызвав метод getItemMax для получения индекса элемента с максимальной позицией
          }
        }

        var _resetPosition = function () { // смещаем последнюю карточку в начало за область видимости
          var lastItem = _items[_items.length - 1]; // Получаем последний элемент из массива _items
          lastItem.position = position.getMin() - 1; // Устанавливаем его позицию на одну меньше минимальной позиции
          lastItem.transform = -_items.length * _itemWidth; // Устанавливаем значение transform для перемещения элемента влево на ширину всех элементов
          lastItem.item.style.transform = 'translateX(' + lastItem.transform + 'px)'; // Применяем CSS-трансформацию для сдвига элемента влево
        };

        var _addIndicators = function () { // Добавление индикатора слайдов
          _setActive(); // Устанавливаем активное состояние перед использованием
          var activeState = _states.find(state => state.active); // Находим активное состояние в массиве _states
          _indexIndicator = activeState.count - 1; // Устанавливаем индекс индикатора в соответствии с активным состоянием
          var sliderIndicator = document.querySelector('.slider__indicator'); // Устанавливаем индекс индикатора в соответствии с активным состоянием
          sliderIndicator.textContent = activeState.count; // Устанавливаем текст индикатора текущего слайда
          _indicatorItems = sliderIndicator; // Сохраняем ссылку на элемент индикатора текущего слайда
          var totalItemsIndicator = document.querySelector('.slider__indicator_all');// Находим элемент для общего числа слайдов
          totalItemsIndicator.textContent = _sliderItems.length; // Устанавливаем текст с общим числом слайдов
        };

        // Функция для трансформации элементов в зависимости от направления
        // Карточки мгновенно перемещаются на новое место без анимации, 
        //а блок с карточками плавно смещается с анимацией, 
        // создавая эффект бесконечного и плавного перелистывания.
        var _transformItem = function (direction) {
          var nextItem; // индекс следующего элемента в слайдере

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
            console.log(_items[nextItem].position);
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

        var _cycle = function (direction) { // организовываем автоматическое циклическое прокручивание элементов в слайдере в указанном направлени
          if (!_config.isCycling) { // Проверяем, включен ли режим цикличного прокручивания (_config.isCycling)
            return; // Если режим цикличного прокручивания не включен, выходим из функции
          }

          _interval = setInterval(function () { // Устанавливаем интервал для циклического прокручивания
            _transformItem(direction); // Вызываем функцию _transformItem с указанным направлением
          }, _config.interval); // Интервал времени для вызова функции _transformItem 
        };

        var _controlClick = function (e) { // Обработчик клика на элементы управления
          if (e.target.classList.contains('slider__control')) { // Проверяем, кликнул ли пользователь на элемент управления слайдером
            e.preventDefault(); // Предотвращаем стандартное поведение браузера по умолчанию
            var direction = e.target.classList.contains('slider__control_right') ? 'right' : 'left'; // Определяем направление движения (вправо или влево)
            _transformItem(direction); // Вызываем функцию _transformItem для выполнения прокрутки в указанном направлении
            clearInterval(_interval); // Останавливаем текущий интервал автоматического листания
            _cycle(_config.direction); // Запускаем цикл автоматического листания, если это предусмотрено настройками
            _indicatorItems.textContent = _indexIndicator + 1; // Обновляем текст индикатора текущего слайда
          }
        };

        var _handleVisibilityChange = function () { // Обработчик изменения видимости страницы
          if (document.visibilityState === "hidden" || document.hidden) { // Проверка состояния видимости документа или страница не активна
            clearInterval(_interval); // Если документ стал невидимым, остановить автоматическую прокрутку слайдов
          } else {
            clearInterval(_interval); // Остановить текущий интервал автоматической прокрутки слайдов
            _cycle(_config.direction); // Запустить автоматическую прокрутку слайдов с заданным направлением
          }
        }

        var _handleWindowBlur = function () { // Обработчик потери фокуса окна браузера (blur)
          clearInterval(_interval); // Остановить текущий интервал автоматической прокрутки слайдов
        };

        var _handleWindowFocus = function () { // Обработчик события получения фокуса окна браузера (focus)
          if (_config.isCycling) { // Проверяем, включен ли режим циклической прокрутки в конфигурации
            clearInterval(_interval); // Остановить текущий интервал автоматической прокрутки слайдов
            _cycle(_config.direction); // Запустить автоматическую прокрутку слайдов с заданным направлением
          }
        };

        var _refresh = function () { // Функция для обновления слайдера
          clearInterval(_interval); // Остановка интервала автоматической прокрутки слайдов
          _mainElement.innerHTML = _html;  // Восстановление исходного HTML содержимого основного элемента слайдера

          // Обновление ссылок на элементы слайдера
          _sliderWrapper = _mainElement.querySelector('.slider__wrapper');
          _sliderItems = _mainElement.querySelectorAll('.slider__item');
          _sliderControls = _mainElement.querySelectorAll('.slider__control');
          _sliderControlLeft = _mainElement.querySelector('.slider__control_left');
          _sliderControlRight = _mainElement.querySelector('.slider__control_right');

          // Обновление значений ширины обертки и слайда
          _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
          _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width) + parseFloat(getComputedStyle(_sliderItems[0]).marginRight);

          // Сброс значений позиции, трансформации и индикатора
          _positionLeftItem = 0;
          _transform = 0;
          _indexIndicator = 0;

          // Пересоздание массива объектов слайдов
          _items = [];
          _sliderItems.forEach(function (item, index) {
            _items.push({ item: item, position: index, transform: 0 });
          });

          _resetPosition(); // Сбрасываем позицию слайдов в начальное состояние
          _addIndicators(); // Добавляем индикаторы для отслеживания текущего слайда
        };

        function _onTouchStart(e) { // Функция обработки начала касания (touchstart)// Функция обработки начала касания (touchstart)
          _startX = e.touches[0].clientX; // Запоминаем начальную позицию касания по оси X
          _isSwiping = true; // Устанавливаем флаг, что идет свайп
          _isMoving = false; // Сбрасываем флаг, что происходит движение
          clearInterval(_interval); // Останавливаем текущий интервал автоматической прокрутки слайдов
        }

        function _onTouchMove(e) { // Функция обработки движения пальца по экрану (touchmove)
          if (!_isSwiping) return; // Если не происходит свайп, выходим из функции

          var _endX = e.touches[0].clientX; // Получаем текущую позицию касания по оси X
          _moveX = _endX - _startX; // Вычисляем расстояние, на которое был смещен палец

          // Ограничиваем смещение, чтобы оно не превышало ширину элемента слайда плюс некоторый запас (32 пикселя)
          if (Math.abs(_moveX) > _itemWidth + 32) {
            _moveX = _moveX < 0 ? -_itemWidth - 32 : _itemWidth + 32;
          }
          _isMoving = Math.abs(_moveX) > 100; // Устанавливаем флаг, что происходит движение на расстояние больше 100 пикселей
          _sliderWrapper.style.transition = 'transform 0s'; // Устанавливаем CSS transition для плавности анимации в 0 секунд
          _sliderWrapper.style.transform = 'translateX(' + (_transform + _moveX) + 'px)'; // Применяем трансформацию для перемещения слайдов
        }

        function _onSwipeEnd(e) {  // Функция обработки окончания свайпа (touchend)
          _isSwiping = false; // Сбрасываем флаг, что идет свайп

          if (_isMoving) {
            // Если было движение пальцем
            if (_moveX < 0) {
              _transformItem('right'); // Перемещаем слайды вправо
            } else {
              _transformItem('left'); // Перемещаем слайды влево
            }
          } else {
            // Если движения не было, возвращаем слайды в исходное положение с анимацией
            _sliderWrapper.style.transition = 'transform 0.5s';
            _sliderWrapper.style.transform = 'translateX(' + _transform + 'px)';
          }
          _cycle(_config.direction); // Запускаем автоматическую прокрутку слайдов с заданным направлением
        };

        var _handleOrientationChange = function () { // Адаптации интерфейса под изменение размеров окна и ориентации устройства
          var _index = 0,  // Индекс активного состояния
            width = parseFloat(document.body.clientWidth);  // Ширина документа

          // Перебор всех состояний (_states) и определение текущего индекса в зависимости от ширины окна
          _states.forEach(function (item, index) {
            if (width >= _states[index].minWidth)
              _index = index;
          });

          // Если текущий индекс не совпадает с активным состоянием, выполняем обновление и активацию
          if (_index !== _getActive()) {
            _setActive();  // Установка активного состояния
            _refresh();    // Обновление интерфейса
          }
        };

        var _setUpListeners = function () { // Установка обработчиков событий
          // Добавление обработчика клика на основной элемент слайдера
          _mainElement.addEventListener('click', _controlClick);

          // Если включена опция паузы при наведении и автоматическая прокрутка слайдов, добавление обработчиков событий для остановки и 
          // возобновления автоматической прокрутки при наведении мыши на слайдер и уходе с него
          if (_config.pause && _config.isCycling) {
            _mainElement.addEventListener('mouseenter', function () { // Обработчик события при наведении мыши на слайдер
              clearInterval(_interval); // Остановка автоматической прокрутки слайдов при наведении мыши
            });
            _mainElement.addEventListener('mouseleave', function () { // Обработчик события при уходе мыши с слайдера
              clearInterval(_interval); // Остановка текущего интервала автоматической прокрутки слайдов
              _cycle(_config.direction); // Запуск автоматической прокрутки слайдов с заданным направлением
            });
          }

          // Обработчики событий для сенсорных устройств (таких как планшеты и мобильные устройства)
          _mainElement.addEventListener('touchstart', _onTouchStart); // пользователь начинает касание (touch) на элементе
          _mainElement.addEventListener('touchmove', _onTouchMove); // пользователь перемещает палец по экрану (событие движения касания)
          _mainElement.addEventListener('touchend', _onSwipeEnd); // пользователь отрывает палец от экрана (завершение касания)

          // Обработчики событий для управления состоянием приложения
          document.addEventListener('visibilitychange', _handleVisibilityChange); // Пользователь свернул браузер
          window.addEventListener('blur', _handleWindowBlur); // Пользователь переключается на другое окно или вкладку
          window.addEventListener('focus', _handleWindowFocus); // Пользователь возвращается к окну или вкладке
          window.addEventListener('resize', _handleOrientationChange); // Пользователь изменил размеров окна браузера
          window.addEventListener('orientationchange', _handleOrientationChange); // Пользователь поворачивает устройство (например, смартфон или планшет)
        };

        _addIndicators(); // Вызов функции для добавления индикаторов слайдера
        _setUpListeners(); // Вызов функции для установки обработчиков событий

        // Запуск автоматической прокрутки, если страница видима
        if (document.visibilityState === "visible") {
          _cycle(_config.direction); // Если документ видим, запускаем цикл автоматической прокрутки слайдов
        }

        _setActive(); // Установка активного состояния слайдера

        return { // Возвращаем объект с методами для управления слайдером
          // Функция для перемещения слайдов вправо
          right: function () {
            _transformItem('right'); // Вызов функции для перемещения слайдов вправо
          },
          // Функция для перемещения слайдов влево
          left: function () {
            _transformItem('left'); // Вызов функции для перемещения слайдов влево
          },
          // Функция для остановки автоматической прокрутки слайдов
          stop: function () {
            _config.isCycling = false; // Установка флага автоматической прокрутки в false
            clearInterval(_interval); // Остановка интервала автоматической прокрутки слайдов
          },
          // Функция для запуска автоматической прокрутки слайдов
          cycle: function () {
            _config.isCycling = true; // Установка флага автоматической прокрутки в true
            clearInterval(_interval); // Остановка текущего интервала автоматической прокрутки слайдов
            _cycle(); // Запуск автоматической прокрутки слайдов
          }
        }
      }
    }());

    var slider = multiItemSlider('.slider', {
      isCycling: true
    });
  }

  handleSladerParticipants();

   window.addEventListener('load', () => {
    // Убеждаемся, что все ресурсы загружены
    setTimeout(() => {
      document.querySelector('.loading-screen').style.display = 'none';
      document.querySelector('.main-content').style.display = 'block';
    }, 1500);
  });

});
