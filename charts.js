// charts.js
class NephrologyCharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: 'rgba(52, 152, 219, 0.7)',
            secondary: 'rgba(46, 204, 113, 0.7)',
            danger: 'rgba(231, 76, 60, 0.7)',
            warning: 'rgba(241, 196, 15, 0.7)',
            border: {
                primary: 'rgba(52, 152, 219, 1)',
                secondary: 'rgba(46, 204, 113, 1)',
                danger: 'rgba(231, 76, 60, 1)',
                warning: 'rgba(241, 196, 15, 1)'
            }
        };
    }

    // Инициализация всех графиков
    initializeCharts() {
        this.createMolecularChart();
        this.createIndexChart();
    }

    // График молекулярных маркеров
    createMolecularChart() {
        const ctx = document.getElementById('molecularChart').getContext('2d');
        
        this.charts.molecular = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'NPHS1 экспрессия', 
                    'WT1 экспрессия', 
                    'IL1B экспрессия', 
                    'TNFα экспрессия', 
                    'C3 компонент'
                ],
                datasets: [{
                    label: 'Профиль пациента',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: this.chartColors.border.primary,
                    borderWidth: 2,
                    pointBackgroundColor: this.chartColors.border.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.chartColors.border.primary
                }, {
                    label: 'Референсные значения',
                    data: [1, 1, 1, 1, 1],
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderColor: this.chartColors.border.secondary,
                    borderWidth: 1,
                    pointBackgroundColor: this.chartColors.border.secondary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.chartColors.border.secondary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 2,
                        ticks: {
                            stepSize: 0.5
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Профиль молекулярных маркеров',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 20,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.formattedValue;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // График клинических индексов
    createIndexChart() {
        const ctx = document.getElementById('indexChart').getContext('2d');
        
        this.charts.index = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Индекс стероидной резистентности (SRI)',
                    'Индекс ремиссии (RI)',
                    'Индекс прогрессирования (CKDPI)'
                ],
                datasets: [{
                    label: 'Значения индексов',
                    data: [0, 0, 0],
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.secondary,
                        this.chartColors.warning
                    ],
                    borderColor: [
                        this.chartColors.border.primary,
                        this.chartColors.border.secondary,
                        this.chartColors.border.warning
                    ],
                    borderWidth: 1,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Клинические индексы',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.formattedValue;
                                
                                // Добавление интерпретации
                                if (context.dataIndex === 0) { // SRI
                                    if (context.raw > 0.63) label += ' (Высокий риск)';
                                    else if (context.raw > 0.5) label += ' (Умеренный риск)';
                                    else label += ' (Низкий риск)';
                                } else if (context.dataIndex === 1) { // RI
                                    if (context.raw > 4.5) label += ' (Высокая вероятность ремиссии)';
                                    else if (context.raw > 2.5) label += ' (Умеренная вероятность)';
                                    else label += ' (Низкая вероятность)';
                                } else if (context.dataIndex === 2) { // CKDPI
                                    if (context.raw > 0.34) label += ' (Быстрое прогрессирование)';
                                    else if (context.raw > 0.25) label += ' (Умеренное прогрессирование)';
                                    else label += ' (Медленное прогрессирование)';
                                }
                                
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Обновление графиков новыми данными
    updateCharts(data, results) {
        // Обновление молекулярного профиля
        this.charts.molecular.data.datasets[0].data = [
            data.nphs1,
            data.wt1,
            data.il1b,
            data.tnfa,
            data.c3/100 // Нормализация для отображения
        ];
        
        // Обновление индексов
        this.charts.index.data.datasets[0].data = [
            parseFloat(results.sri.value),
            parseFloat(results.ri.value)/10, // Нормализация для отображения
            parseFloat(results.ckdpi.value)
        ];

        // Обновление цветов индексов на основе значений
        this.updateIndexColors(results);

        // Обновление отображения графиков
        this.charts.molecular.update();
        this.charts.index.update();
    }

    // Обновление цветов индексов на основе их значений
    updateIndexColors(results) {
        const colors = {
            backgroundColor: [],
            borderColor: []
        };

        // SRI
        if (parseFloat(results.sri.value) > 0.63) {
            colors.backgroundColor.push(this.chartColors.danger);
            colors.borderColor.push(this.chartColors.border.danger);
        } else if (parseFloat(results.sri.value) > 0.5) {
            colors.backgroundColor.push(this.chartColors.warning);
            colors.borderColor.push(this.chartColors.border.warning);
        } else {
            colors.backgroundColor.push(this.chartColors.secondary);
            colors.borderColor.push(this.chartColors.border.secondary);
        }

        // RI
        if (parseFloat(results.ri.value) > 4.5) {
            colors.backgroundColor.push(this.chartColors.secondary);
            colors.borderColor.push(this.chartColors.border.secondary);
        } else if (parseFloat(results.ri.value) > 2.5) {
            colors.backgroundColor.push(this.chartColors.primary);
            colors.borderColor.push(this.chartColors.border.primary);
        } else {
            colors.backgroundColor.push(this.chartColors.danger);
            colors.borderColor.push(this.chartColors.border.danger);
        }

        // CKDPI
        if (parseFloat(results.ckdpi.value) > 0.34) {
            colors.backgroundColor.push(this.chartColors.danger);
            colors.borderColor.push(this.chartColors.border.danger);
        } else if (parseFloat(results.ckdpi.value) > 0.25) {
            colors.backgroundColor.push(this.chartColors.warning);
            colors.borderColor.push(this.chartColors.border.warning);
        } else {
            colors.backgroundColor.push(this.chartColors.secondary);
            colors.borderColor.push(this.chartColors.border.secondary);
        }

        this.charts.index.data.datasets[0].backgroundColor = colors.backgroundColor;
        this.charts.index.data.datasets[0].borderColor = colors.borderColor;
    }
}

// Экспорт класса графиков
window.NephrologyCharts = NephrologyCharts;