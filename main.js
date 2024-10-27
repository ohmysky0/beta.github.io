// main.js
document.addEventListener('DOMContentLoaded', function() {
    const calculator = new NephrologyCalculator();
    const charts = new NephrologyCharts();
    
    // Инициализация графиков
    charts.initializeCharts();

    // Инициализация всплывающих подсказок
    const tooltipData = {
        'creatinine': {
            normal: '0.3-1.2 мг/дл',
            description: 'Показатель фильтрационной функции почек'
        },
        'proteinuria': {
            normal: '<3.5 г/сут',
            description: 'Маркер повреждения клубочкового фильтра'
        },
        'c3': {
            normal: '90-180 мг/дл',
            description: 'Компонент комплемента, маркер воспаления'
        },
        'nphs1': {
            normal: '>0.8',
            description: 'Нефрин, маркер целостности подоцитов'
        },
        'wt1': {
            normal: '>0.8',
            description: 'Опухолевый супрессор Wilms, регулятор подоцитов'
        },
        'il1b': {
            normal: '<1.2',
            description: 'Интерлейкин 1β, провоспалительный цитокин'
        },
        'tnfa': {
            normal: '<1.2',
            description: 'Фактор некроза опухоли α, провоспалительный цитокин'
        }
    };

    initializeTooltips(tooltipData);

    // Загрузка демо-данных
    document.getElementById('demo-data').addEventListener('click', function() {
        loadDemoData();
        // Автоматический расчет после загрузки демо-данных
        setTimeout(() => {
            document.getElementById('calculate').click();
        }, 100);
    });

    // Расчет результатов
    document.getElementById('calculate').addEventListener('click', function() {
        if (validateAndCalculate()) {
            this.classList.add('success-animation');
            setTimeout(() => {
                this.classList.remove('success-animation');
            }, 1000);
        }
    });

    // Обработчики для живой валидации
    initializeInputValidation();

    // Функции инициализации
    function initializeTooltips(tooltipData) {
        Object.entries(tooltipData).forEach(([id, data]) => {
            const element = document.getElementById(id);
            if (element) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.innerHTML = `
                    <strong>Нормальные значения:</strong> ${data.normal}<br>
                    <small>${data.description}</small>
                `;
                element.parentNode.appendChild(tooltip);

                // События для показа/скрытия подсказки
                element.addEventListener('focus', () => tooltip.style.opacity = '1');
                element.addEventListener('blur', () => tooltip.style.opacity = '0');
                element.addEventListener('mouseover', () => tooltip.style.opacity = '1');
                element.addEventListener('mouseout', () => tooltip.style.opacity = '0');
            }
        });
    }

    function initializeInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateInput(this);
            });
        });
    }

    // Функции загрузки и валидации данных
    function loadDemoData() {
        const demo = calculator.demoData;
        Object.entries(demo).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
                validateInput(element);
            }
        });
    }

    function validateInput(input) {
        const value = parseFloat(input.value);
        let isValid = true;
        
        // Проверка на пустое значение
        if (input.value === '') {
            input.style.borderColor = '#ddd';
            return false;
        }

        // Валидация по диапазонам
        switch(input.id) {
            case 'age':
                isValid = value >= 0 && value <= 100;
                break;
            case 'creatinine':
                isValid = value >= 0 && value <= 10;
                break;
            case 'proteinuria':
                isValid = value >= 0 && value <= 20;
                break;
            case 'c3':
                isValid = value >= 0 && value <= 200;
                break;
            case 'nphs1':
            case 'wt1':
                isValid = value >= 0 && value <= 2;
                break;
            case 'il1b':
            case 'tnfa':
                isValid = value >= 0 && value <= 5;
                break;
        }

        input.style.borderColor = isValid ? '#2ecc71' : '#e74c3c';
        return isValid;
    }

    function validateAndCalculate() {
        // Сбор данных из формы
        const data = {
            gender: document.getElementById('gender').value,
            age: parseFloat(document.getElementById('age').value),
            creatinine: parseFloat(document.getElementById('creatinine').value),
            proteinuria: parseFloat(document.getElementById('proteinuria').value),
            c3: parseFloat(document.getElementById('c3').value),
            nphs1: parseFloat(document.getElementById('nphs1').value),
            wt1: parseFloat(document.getElementById('wt1').value),
            il1b: parseFloat(document.getElementById('il1b').value),
            tnfa: parseFloat(document.getElementById('tnfa').value)
        };

        // Проверка на пустые значения и валидацию
        let isValid = true;
        let invalidFields = [];

        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'gender' && (isNaN(value) || !validateInput(document.getElementById(key)))) {
                isValid = false;
                invalidFields.push(key);
            }
        });

        if (!isValid) {
            alert(`Пожалуйста, проверьте следующие поля:\n${invalidFields.join('\n')}`);
            return false;
        }

        // Расчет результатов
        const results = {
            mgfr: calculator.calculateMGFR(data),
            sri: calculator.calculateSRI(data),
            ri: calculator.calculateRI(data),
            ckdpi: calculator.calculateCKDPI(data)
        };

        // Обновление результатов на странице
        updateResults(results);
        
        // Обновление графиков
        charts.updateCharts(data, results);
        
        // Генерация подробного отчета
        const report = calculator.generateDetailedReport(data, results);
        updateDetailedReport(report);

        return true;
    }

    // Функции обновления интерфейса
    function updateResults(results) {
        // Обновление значений и интерпретаций
        updateResultCard('mgfr', results.mgfr);
        updateResultCard('sri', results.sri);
        updateResultCard('ri', results.ri);
        updateResultCard('ckdpi', results.ckdpi);

        // Анимация появления результатов
        document.querySelector('.results-content').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.results-content').style.opacity = '1';
        }, 100);
    }

    function updateResultCard(id, result) {
        const card = document.getElementById(`${id}-card`);
        const valueElement = document.getElementById(`${id}-value`);
        const interpretationElement = document.getElementById(`${id}-interpretation`);

        valueElement.textContent = result.value;
        interpretationElement.textContent = result.interpretation;

        // Обновление стилей карточки
        updateCardStyle(card, id, parseFloat(result.value));
    }

    function updateCardStyle(card, id, value) {
        // Удаление предыдущих классов стилей
        card.classList.remove('success', 'warning', 'danger');

        // Определение стиля на основе значения
        switch(id) {
            case 'mgfr':
                if (value > 200) card.classList.add('danger');
                else if (value >= 175) card.classList.add('success');
                else if (value >= 145) card.classList.add('warning');
                else card.classList.add('danger');
                break;
            case 'sri':
                if (value > 0.63) card.classList.add('danger');
                else if (value >= 0.5) card.classList.add('warning');
                else card.classList.add('success');
                break;
            case 'ri':
                if (value > 4.5) card.classList.add('success');
                else if (value >= 2.5) card.classList.add('warning');
                else card.classList.add('danger');
                break;
            case 'ckdpi':
                if (value > 0.34) card.classList.add('danger');
                else if (value >= 0.25) card.classList.add('warning');
                else card.classList.add('success');
                break;
        }
    }

    function updateDetailedReport(report) {
        const reportContent = document.querySelector('.report-content');
        reportContent.innerHTML = '';

        // Создание секций отчета
        Object.entries(report).forEach(([key, section]) => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'report-section';
            
            const title = document.createElement('h4');
            title.textContent = section.title;
            
            const content = document.createElement('p');
            content.textContent = section.content;
            
            sectionElement.appendChild(title);
            sectionElement.appendChild(content);
            reportContent.appendChild(sectionElement);
        });

        // Добавление времени генерации отчета
        const timestamp = document.createElement('div');
        timestamp.className = 'report-timestamp';
        timestamp.textContent = `Отчет сгенерирован: ${new Date().toLocaleString()}`;
        reportContent.appendChild(timestamp);

        // Анимация появления отчета
        reportContent.style.opacity = '0';
        setTimeout(() => {
            reportContent.style.opacity = '1';
        }, 100);
    }
});