// calculators.js
class NephrologyCalculator {
    constructor() {
        // Демо-данные из реальной базы
        this.demoData = {
            gender: 'M',
            age: 6.5,
            creatinine: 0.3,
            proteinuria: 4.4,
            c3: 78,
            nphs1: 0.79,
            wt1: 0.72,
            il1b: 1.35,
            tnfa: 1.23
        };

        // Референсные значения для показателей
        this.referenceRanges = {
            mgfr: {
                severe_decline: { max: 130, text: "Выраженное снижение" },
                moderate_decline: { min: 130, max: 145, text: "Умеренное снижение" },
                mild_decline: { min: 145, max: 175, text: "Начальное снижение" },
                normal: { min: 175, max: 200, text: "Оптимальная функция" },
                hyperfiltration: { min: 200, text: "Гиперфильтрация" }
            },
            sri: {
                low: { max: 0.5, text: "Низкий риск стероидной резистентности", risk: "<10%" },
                moderate: { min: 0.5, max: 0.63, text: "Умеренный риск стероидной резистентности", risk: "10-30%" },
                high: { min: 0.63, text: "Высокий риск стероидной резистентности", risk: ">70%" }
            },
            ri: {
                low: { max: 2.5, text: "Низкая вероятность ремиссии", probability: "<40%" },
                moderate: { min: 2.5, max: 4.5, text: "Вероятность частичной ремиссии", probability: "60-80%" },
                high: { min: 4.5, text: "Высокая вероятность полной ремиссии", probability: ">85%" }
            },
            ckdpi: {
                low: { max: 0.25, text: "Медленное прогрессирование" },
                moderate: { min: 0.25, max: 0.34, text: "Умеренное прогрессирование" },
                high: { min: 0.34, text: "Быстрое прогрессирование" }
            }
        };
    }

    // Модифицированная формула СКФ (mGFR)
    calculateMGFR(data) {
        // Базовый CKD-EPI (педиатрическая модификация)
        const k = data.gender === 'F' ? 0.7 : 0.9;
        const a = data.gender === 'F' ? -0.329 : -0.411;
        
        const baseCKDEPI = 141 * 
                          Math.min(data.creatinine/k, 1)**a * 
                          Math.max(data.creatinine/k, 1)**-1.209 * 
                          0.993**data.age;

        // Молекулярный модификатор
        const molecularMod = Math.pow(
            (data.nphs1 * data.wt1)/(data.il1b * data.tnfa), 
            0.05
        );

        // Функциональный модификатор
        const functionalMod = Math.pow(
            data.c3/(data.proteinuria * data.creatinine), 
            0.05
        );

        const mGFR = baseCKDEPI * molecularMod * functionalMod * 0.8;

        return {
            value: mGFR.toFixed(1),
            interpretation: this.interpretMGFR(mGFR),
            details: {
                baseCKDEPI: baseCKDEPI.toFixed(1),
                molecularMod: molecularMod.toFixed(3),
                functionalMod: functionalMod.toFixed(3)
            }
        };
    }

    // Индекс стероидной резистентности (SRI)
    calculateSRI(data) {
        const sri = Math.pow(data.il1b, 0.5) / 
                   (Math.pow(data.nphs1 * data.wt1, 0.7)) * 
                   Math.pow(data.proteinuria/data.c3, 0.3);

        return {
            value: sri.toFixed(3),
            interpretation: this.interpretSRI(sri),
            risk: this.getRiskLevel('sri', sri)
        };
    }

    // Индекс ремиссии (RI)
    calculateRI(data) {
        const ri = Math.pow(data.nphs1 * data.wt1, 0.8) * 
                  Math.pow(data.c3/(data.proteinuria * data.creatinine), 0.5) /
                  Math.pow(data.il1b, 0.4);

        return {
            value: ri.toFixed(3),
            interpretation: this.interpretRI(ri),
            probability: this.getRemissionProbability(ri)
        };
    }

    // Индекс прогрессирования ХБП (CKDPI)
    calculateCKDPI(data) {
        const ckdpi = Math.pow(1/(data.nphs1 * data.wt1), 0.6) * 
                     Math.pow(data.il1b, 0.5) * 
                     Math.pow((data.proteinuria * data.creatinine)/data.c3, 0.4);

        return {
            value: ckdpi.toFixed(3),
            interpretation: this.interpretCKDPI(ckdpi),
            progression: this.getProgressionRate(ckdpi)
        };
    }

    // Интерпретации показателей
    interpretMGFR(value) {
        const ranges = this.referenceRanges.mgfr;
        if (value > ranges.hyperfiltration.min) return ranges.hyperfiltration.text;
        if (value >= ranges.normal.min) return ranges.normal.text;
        if (value >= ranges.mild_decline.min) return ranges.mild_decline.text;
        if (value >= ranges.moderate_decline.min) return ranges.moderate_decline.text;
        return ranges.severe_decline.text;
    }

    interpretSRI(value) {
        const ranges = this.referenceRanges.sri;
        if (value > ranges.high.min) return ranges.high.text;
        if (value >= ranges.moderate.min) return ranges.moderate.text;
        return ranges.low.text;
    }

    interpretRI(value) {
        const ranges = this.referenceRanges.ri;
        if (value > ranges.high.min) return ranges.high.text;
        if (value >= ranges.moderate.min) return ranges.moderate.text;
        return ranges.low.text;
    }

    interpretCKDPI(value) {
        const ranges = this.referenceRanges.ckdpi;
        if (value > ranges.high.min) return ranges.high.text;
        if (value >= ranges.moderate.min) return ranges.moderate.text;
        return ranges.low.text;
    }

    // Вспомогательные функции для определения рисков и вероятностей
    getRiskLevel(index, value) {
        const ranges = this.referenceRanges[index];
        for (const [level, range] of Object.entries(ranges)) {
            if ((range.min === undefined || value >= range.min) &&
                (range.max === undefined || value < range.max)) {
                return range.risk || range.text;
            }
        }
        return "Неопределенный риск";
    }

    getRemissionProbability(value) {
        const ranges = this.referenceRanges.ri;
        if (value > ranges.high.min) return ranges.high.probability;
        if (value >= ranges.moderate.min) return ranges.moderate.probability;
        return ranges.low.probability;
    }

    getProgressionRate(value) {
        const ranges = this.referenceRanges.ckdpi;
        if (value > ranges.high.min) return "Высокий риск быстрого прогрессирования";
        if (value >= ranges.moderate.min) return "Умеренный риск прогрессирования";
        return "Низкий риск прогрессирования";
    }

    // Генерация подробного клинического отчета
    generateDetailedReport(data, results) {
        return {
            basicAssessment: {
                title: "Базовая оценка",
                content: this.generateBasicAssessment(data, results)
            },
            molecularProfile: {
                title: "Молекулярный профиль",
                content: this.generateMolecularProfile(data, results)
            },
            clinicalPrediction: {
                title: "Клинический прогноз",
                content: this.generateClinicalPrediction(results)
            },
            therapeuticRecommendations: {
                title: "Терапевтические рекомендации",
                content: this.generateTherapeuticRecommendations(results)
            }
        };
    }

    generateBasicAssessment(data, results) {
        return `Пациент ${data.gender === 'M' ? 'мужского' : 'женского'} пола, ${data.age} лет. 
                Уровень креатинина ${data.creatinine} мг/дл, суточная протеинурия ${data.proteinuria} г/сут. 
                Модифицированная СКФ составляет ${results.mgfr.value} мл/мин/1.73м², что соответствует ${results.mgfr.interpretation.toLowerCase()}.`;
    }

    generateMolecularProfile(data, results) {
        const podocyteStatus = data.nphs1 < 0.8 || data.wt1 < 0.8 ? 
            "снижение экспрессии подоцитарных маркеров" : 
            "нормальная экспрессия подоцитарных маркеров";
        
        const inflammationStatus = data.il1b > 1.2 || data.tnfa > 1.2 ?
            "повышение провоспалительных маркеров" :
            "нормальный уровень провоспалительных маркеров";

        return `Молекулярный анализ выявил ${podocyteStatus} (NPHS1: ${data.nphs1}, WT1: ${data.wt1}) и ${inflammationStatus} 
                (IL1B: ${data.il1b}, TNFα: ${data.tnfa}). Индекс стероидной резистентности ${results.sri.value} указывает на ${results.sri.interpretation.toLowerCase()}.`;
    }

    generateClinicalPrediction(results) {
        return `На основании комплексного анализа прогнозируется ${results.ri.interpretation.toLowerCase()} 
                с вероятностью ${results.ri.probability}. Индекс прогрессирования ХБП (${results.ckdpi.value}) указывает на ${results.ckdpi.interpretation.toLowerCase()}.`;
    }

    generateTherapeuticRecommendations(results) {
        let recommendations = [];
        
        // Рекомендации на основе SRI
        if (parseFloat(results.sri.value) > 0.63) {
            recommendations.push("Рекомендуется раннее назначение стероид-сберегающей терапии");
        }
        
        // Рекомендации на основе CKDPI
        if (parseFloat(results.ckdpi.value) > 0.34) {
            recommendations.push("Требуется интенсификация нефропротективной терапии");
        }
        
        // Рекомендации на основе RI
        if (parseFloat(results.ri.value) < 2.5) {
            recommendations.push("Показана модификация иммуносупрессивной терапии");
        } else if (parseFloat(results.ri.value) > 4.5) {
            recommendations.push("Рекомендуется поддерживающая терапия с постепенным снижением дозы иммуносупрессантов");
        }

        return recommendations.join(". ") + 
               ". Необходим регулярный мониторинг молекулярных маркеров для оценки эффективности терапии.";
    }
}

// Экспорт калькулятора
window.NephrologyCalculator = NephrologyCalculator;