// script.js

// Основной класс калькулятора
class NephroCalculator {
    static COEFFICIENTS = {
        SEX: {
            'М': 1.0,
            'Ж': 0.93
        },
        AGE_GROUPS: {
            CHILD: { max: 7, coef: 1.05 },
            TEEN: { min: 7, coef: 1.0 }
        }
    };
 
    // Конструктор для инициализации данных
    constructor(formData) {
        this.data = {
            age: parseFloat(formData.age),
            sex: formData.sex,
            nphs1: parseFloat(formData.nphs1),
            wt1: parseFloat(formData.wt1),
            il1b: parseFloat(formData.il1b),
            tnfa: parseFloat(formData.tnfa),
            c3: parseFloat(formData.c3),
            proteinuria: parseFloat(formData.proteinuria),
            creatinine: parseFloat(formData.creatinine),
            ckdEpi: parseFloat(formData.ckdEpi)
        };
 
        this.ageCoefficient = this.calculateAgeCoefficient();
        this.sexCoefficient = NephroCalculator.COEFFICIENTS.SEX[this.data.sex];
    }
 
    // Расчет возрастного коэффициента
    calculateAgeCoefficient() {
        return this.data.age <= NephroCalculator.COEFFICIENTS.AGE_GROUPS.CHILD.max 
            ? NephroCalculator.COEFFICIENTS.AGE_GROUPS.CHILD.coef 
            : NephroCalculator.COEFFICIENTS.AGE_GROUPS.TEEN.coef;
    }
 
    // Расчет модифицированной СКФ (mGFR)
    calculateMGFR() {
        const molecularModifier = Math.pow(
            (this.data.nphs1 * this.data.wt1) / (this.data.il1b * this.data.tnfa),
            0.05
        );
 
        const functionalModifier = Math.pow(
            this.data.c3 / (this.data.proteinuria * this.data.creatinine),
            0.05
        );
 
        const mGFR = this.data.ckdEpi * 
                    molecularModifier * 
                    functionalModifier * 
                    0.8 * 
                    this.ageCoefficient * 
                    this.sexCoefficient;
 
        return parseFloat(mGFR.toFixed(1));
    }
 
    // Расчет индекса стероидной резистентности (SRI)
    calculateSRI() {
        const sri = (Math.pow(this.data.il1b, 0.5) / 
                    Math.pow(this.data.nphs1 * this.data.wt1, 0.7)) * 
                    Math.pow(this.data.proteinuria / this.data.c3, 0.3);
        
        return parseFloat(sri.toFixed(2));
    }
 
    // Расчет индекса ремиссии (RI)
    calculateRI() {
        const ri = (Math.pow(this.data.nphs1 * this.data.wt1, 0.8) * 
                   Math.pow(this.data.c3 / (this.data.proteinuria * this.data.creatinine), 0.5)) / 
                   Math.pow(this.data.il1b, 0.4);
        
        return parseFloat(ri.toFixed(2));
    }
 
    // Расчет индекса прогрессирования ХБП (CKDPI)
    calculateCKDPI() {
        const ckdpi = Math.pow(1/(this.data.nphs1 * this.data.wt1), 0.6) * 
                     Math.pow(this.data.il1b, 0.5) * 
                     Math.pow((this.data.proteinuria * this.data.creatinine)/this.data.c3, 0.4);
        
        return parseFloat(ckdpi.toFixed(2));
    }
 
    // Расчет комплексного молекулярного индекса (CMI)
    calculateCMI() {
        const cmi = (this.data.nphs1 * this.data.wt1 * this.data.c3) / 
                   (this.data.il1b * this.data.proteinuria);
        
        return parseFloat(cmi.toFixed(2));
    }
 
    // Получение всех результатов
    getAllResults() {
        return {
            mGFR: this.calculateMGFR(),
            sri: this.calculateSRI(),
            ri: this.calculateRI(),
            ckdpi: this.calculateCKDPI(),
            cmi: this.calculateCMI()
        };
    }
 }
 
 // Класс для интерпретации результатов
 class ResultInterpreter {
    static RANGES = {
        mGFR: {
            HYPER: 200,
            OPTIMAL: { MIN: 175, MAX: 200 },
            INITIAL: { MIN: 145, MAX: 175 },
            MODERATE: { MIN: 130, MAX: 145 }
        },
        SRI: {
            LOW: 0.5,
            MODERATE: 0.63
        },
        RI: {
            HIGH: 4.5,
            MODERATE: 2.5
        },
        CKDPI: {
            LOW: 0.25,
            MODERATE: 0.34
        },
        CMI: {
            HIGH: 2.0,
            MODERATE: 1.0
        }
    };
 
    static getMGFRStatus(value) {
        if (value > this.RANGES.mGFR.HYPER) {
            return {
                status: 'Гиперфильтрация',
                description: '95-й перцентиль контрольной группы',
                class: 'danger',
                recommendation: 'Требуется тщательный мониторинг функции почек'
            };
        } else if (value >= this.RANGES.mGFR.OPTIMAL.MIN) {
            return {
                status: 'Оптимальная функция',
                description: 'Норма',
                class: 'normal',
                recommendation: 'Продолжать текущую терапию'
            };
        } else if (value >= this.RANGES.mGFR.INITIAL.MIN) {
            return {
                status: 'Начальное снижение',
                description: 'Умеренное отклонение от нормы',
                class: 'warning',
                recommendation: 'Рекомендуется коррекция терапии'
            };
        } else if (value >= this.RANGES.mGFR.MODERATE.MIN) {
            return {
                status: 'Умеренное снижение',
                description: 'Значительное отклонение',
                class: 'warning',
                recommendation: 'Требуется усиление терапии'
            };
        } else {
            return {
                status: 'Выраженное снижение',
                description: 'Критическое значение',
                class: 'danger',
                recommendation: 'Требуется немедленная коррекция терапии'
            };
        }
    }
 
    static getSRIStatus(value) {
        if (value < this.RANGES.SRI.LOW) {
            return {
                status: 'Низкий риск стероидной резистентности',
                description: 'Вероятность <10%',
                class: 'normal',
                recommendation: 'Стандартная терапия'
            };
        } else if (value <= this.RANGES.SRI.MODERATE) {
            return {
                status: 'Умеренный риск',
                description: 'Вероятность 10-30%',
                class: 'warning',
                recommendation: 'Требуется мониторинг'
            };
        } else {
            return {
                status: 'Высокий риск',
                description: 'Вероятность >70%',
                class: 'danger',
                recommendation: 'Рассмотреть альтернативную терапию'
            };
        }
    }
 
    static getRIStatus(value) {
        if (value > this.RANGES.RI.HIGH) {
            return {
                status: 'Высокая вероятность полной ремиссии',
                description: 'Вероятность >85%',
                class: 'normal',
                recommendation: 'Продолжить текущую терапию'
            };
        } else if (value >= this.RANGES.RI.MODERATE) {
            return {
                status: 'Вероятность частичной ремиссии',
                description: 'Вероятность 60-80%',
                class: 'warning',
                recommendation: 'Рассмотреть усиление терапии'
            };
        } else {
            return {
                status: 'Низкая вероятность ремиссии',
                description: 'Вероятность <40%',
                class: 'danger',
                recommendation: 'Требуется смена терапевтической тактики'
            };
        }
    }
 
    static getCKDPIStatus(value) {
        if (value < this.RANGES.CKDPI.LOW) {
            return {
                status: 'Медленное прогрессирование',
                class: 'normal',
                recommendation: 'Продолжить текущую терапию'
            };
        } else if (value <= this.RANGES.CKDPI.MODERATE) {
            return {
                status: 'Умеренное прогрессирование',
                class: 'warning',
                recommendation: 'Усиление нефропротективной терапии'
            };
        } else {
            return {
                status: 'Быстрое прогрессирование',
                class: 'danger',
                recommendation: 'Агрессивная терапия'
            };
        }
    }
 
    static getCMIStatus(value) {
        if (value > this.RANGES.CMI.HIGH) {
            return {
                status: 'Благоприятный прогноз',
                description: 'Вероятность >90%',
                class: 'normal',
                recommendation: 'Стандартное наблюдение'
            };
        } else if (value >= this.RANGES.CMI.MODERATE) {
            return {
                status: 'Умеренный прогноз',
                description: 'Вероятность 50-90%',
                class: 'warning',
                recommendation: 'Регулярный мониторинг'
            };
        } else {
            return {
                status: 'Неблагоприятный прогноз',
                description: 'Вероятность <50%',
                class: 'danger',
                recommendation: 'Интенсивное наблюдение'
            };
        }
    }
 }
 
 // Класс для создания и обновления графиков
 class ChartManager {
    constructor() {
        this.charts = {};
        Chart.defaults.font.family = "'Segoe UI', Arial, sans-serif";
        Chart.defaults.font.size = 12;
    }
 
    createMGFRChart(value) {
        const ctx = document.getElementById('mgfrChart').getContext('2d');
        
        if (this.charts.mgfr) {
            this.charts.mgfr.destroy();
        }
 
        this.charts.mgfr = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Гиперфильтрация', 'Оптимальная функция', 'Начальное снижение', 'Умеренное снижение', 'Текущее значение'],
                datasets: [{
                    label: 'мл/мин/1.73м²',
                    data: [200, 175, 145, 130, value],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 250
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Динамика СКФ'
                    }
                }
            }
        });
    }
 
    // Создание других графиков...
 }
 
 // Класс управления формой
 class FormManager {
    constructor() {
        this.form = document.getElementById('calculatorForm');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultsSection = document.getElementById('results');
        
        this.chartManager = new ChartManager();
        
        this.bindEvents();
    }
 
    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.handleCalculate());
        this.sampleBtn.addEventListener('click', () => this.fillSampleData());
        this.clearBtn.addEventListener('click', () => this.clearForm());
    }
 
    getFormData() {
        return {
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            nphs1: document.getElementById('nphs1').value,
            wt1: document.getElementById('wt1').value,
            il1b: document.getElementById('il1b').value,
            tnfa: document.getElementById('tnfa').value,
            c3: document.getElementById('c3').value,
            proteinuria: document.getElementById('proteinuria').value,
            creatinine: document.getElementById('creatinine').value,
            ckdEpi: document.getElementById('ckd-epi').value
        };
    }
 
    validateData(data) {
        for (let key in data) {
            if (!data[key] || isNaN(parseFloat(data[key]))) {
                alert(`Пожалуйста, заполните поле ${key}`);
                return false;
            }
        }
        return true;
    }
 
    handleCalculate() {
        const formData = this.getFormData();
        
        if (!this.validateData(formData)) {
            return;
        }
 
        const calculator = new NephroCalculator(formData);
        const results = calculator.getAllResults();
        
        this.displayResults(results);
        this.resultsSection.classList.remove('hidden');
    }
 
    // Продолжение script.js

   displayResults(results) {
    // Отображение mGFR
    const mgfrStatus = ResultInterpreter.getMGFRStatus(results.mGFR);
    this.updateResultBlock('mgfr', results.mGFR, mgfrStatus);
    this.chartManager.createMGFRChart(results.mGFR);

    // Отображение SRI
    const sriStatus = ResultInterpreter.getSRIStatus(results.sri);
    this.updateResultBlock('sri', results.sri, sriStatus);
    this.createGaugeChart('sriChart', results.sri, 0, 1, [
        { value: 0.5, label: 'Низкий риск' },
        { value: 0.63, label: 'Умеренный риск' },
        { value: 1, label: 'Высокий риск' }
    ]);

    // Отображение RI
    const riStatus = ResultInterpreter.getRIStatus(results.ri);
    this.updateResultBlock('ri', results.ri, riStatus);
    this.createGaugeChart('riChart', results.ri, 0, 6, [
        { value: 2.5, label: 'Низкая вероятность' },
        { value: 4.5, label: 'Частичная ремиссия' },
        { value: 6, label: 'Полная ремиссия' }
    ]);

    // Отображение CKDPI
    const ckdpiStatus = ResultInterpreter.getCKDPIStatus(results.ckdpi);
    this.updateResultBlock('ckdpi', results.ckdpi, ckdpiStatus);
    this.createGaugeChart('ckdpiChart', results.ckdpi, 0, 0.5, [
        { value: 0.25, label: 'Медленное' },
        { value: 0.34, label: 'Умеренное' },
        { value: 0.5, label: 'Быстрое' }
    ]);

    // Отображение CMI
    const cmiStatus = ResultInterpreter.getCMIStatus(results.cmi);
    this.updateResultBlock('cmi', results.cmi, cmiStatus);
    this.createGaugeChart('cmiChart', results.cmi, 0, 3, [
        { value: 1.0, label: 'Неблагоприятный' },
        { value: 2.0, label: 'Умеренный' },
        { value: 3.0, label: 'Благоприятный' }
    ]);
}

updateResultBlock(id, value, status) {
    document.getElementById(`${id}-value`).textContent = value.toFixed(2);
    const statusElement = document.getElementById(`${id}-status`);
    statusElement.textContent = status.status;
    statusElement.className = `status ${status.class}`;
    
    // Добавляем описание и рекомендации
    const descriptionElement = document.getElementById(`${id}-description`);
    if (descriptionElement) {
        descriptionElement.textContent = status.description || '';
    }
    
    const recommendationElement = document.getElementById(`${id}-recommendation`);
    if (recommendationElement) {
        recommendationElement.textContent = status.recommendation || '';
    }
}

createGaugeChart(canvasId, value, min, max, thresholds) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Уничтожаем существующий график, если есть
    if (this.chartManager.charts[canvasId]) {
        this.chartManager.charts[canvasId].destroy();
    }

    const gradientColors = {
        normal: '#27ae60',
        warning: '#f1c40f',
        danger: '#e74c3c'
    };

    const gradient = ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, gradientColors.normal);
    gradient.addColorStop(0.5, gradientColors.warning);
    gradient.addColorStop(1, gradientColors.danger);

    this.chartManager.charts[canvasId] = new Chart(ctx, {
        type: 'gauge',
        data: {
            datasets: [{
                value: value,
                minValue: min,
                maxValue: max,
                data: thresholds.map(t => t.value),
                backgroundColor: gradient
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            needle: {
                radiusPercentage: 2,
                widthPercentage: 3.2,
                lengthPercentage: 80,
                color: 'rgba(0, 0, 0, 0.9)'
            },
            valueLabel: {
                display: true,
                formatter: (value) => value.toFixed(2)
            }
        }
    });
}

// Пример данных на основе клинического примера из файла
fillSampleData() {
    const sampleData = {
        age: 6.5,
        sex: 'М',
        nphs1: 0.79,
        wt1: 0.72,
        il1b: 1.35,
        tnfa: 1.23,
        c3: 78,
        proteinuria: 4.4,
        creatinine: 0.3,
        ckdEpi: 211.6
    };

    Object.keys(sampleData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = sampleData[key];
        }
    });
}

clearForm() {
    this.form.reset();
    this.resultsSection.classList.add('hidden');
    
    // Очищаем все графики
    Object.values(this.chartManager.charts).forEach(chart => chart.destroy());
    this.chartManager.charts = {};
}
}

// Инициализация формы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
const formManager = new FormManager();

// Добавляем валидацию на ввод отрицательных значений
const numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (value < 0) {
            e.target.value = 0;
        }
    });
});

// Добавляем обработку клавиши Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        formManager.handleCalculate();
    }
});

// Экспорт в PDF (если нужно)
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const doc = new jsPDF();
        // Логика экспорта в PDF
    });
}
});