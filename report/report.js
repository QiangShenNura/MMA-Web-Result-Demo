(() => {
    "use strict";

    const copy = {
        en: {
            title: "Health Assessment",
            back: "Back",
            print: "Print report",
            loading: "Preparing measurement report…",
            missing: "No measurement results were supplied.",
            measurement: "Measurement ID",
            name: "Health Parameter(s)",
            result: "Result",
            range: "Reference Range",
            quality: "SNR",
            disclaimer: "This content is for informational purposes only and is not a substitute for the judgment of a health care professional. It is intended to improve awareness of general wellness.",
            status: ["Very low", "Low", "Medium", "High", "Very high"],
            groups: ["Vitals", "Physiological", "Mental", "Physical", "10 Year General Risks", "Metabolic Risks", "Blood Biomarkers Factors"]
        },
        zh: {
            title: "健康状况报告",
            back: "返回",
            print: "打印报告",
            loading: "正在生成测量报告…",
            missing: "未收到测量结果。",
            measurement: "测量 ID",
            name: "项目名称",
            result: "结果",
            range: "参考范围值",
            quality: "信噪比",
            disclaimer: "此内容仅供参考，不能替代医疗专业人员的判断。它旨在提高人们对整体健康的认知。",
            status: ["很低", "低", "一般", "偏高", "较高"],
            groups: ["生命体征", "生理指标", "心理指标", "身体指标", "10年内一般风险", "代谢风险", "血液生化标志物"]
        }
    };

    const definitions = [
        { group: 0, key: "HR_BPM", name: ["Heart Rate", "心率"], decimals: 0, unit: "bpm", range: "60 - 100 bpm", segments: [[20, 60, "yellow"], [60, 100, "green"], [100, 140, "yellow"]] },
        { group: 0, key: "IHB_COUNT", name: ["Irregular Heartbeats", "不规则心跳"], decimals: 0, unit: "", range: "0" },
        { group: 0, key: "BR_BPM", name: ["Breathing Rate", "呼吸率"], decimals: 0, unit: "brpm", range: "12 - 25 brpm", segments: [[1.2, 12, "yellow"], [12, 25, "green"], [25, 35, "yellow"]] },
        { group: 0, key: "BP_SYSTOLIC", name: ["Systolic Blood Pressure", "收缩压"], decimals: 0, unit: "mmHg", range: "90 - 130 mmHg", segments: [[45, 90, "yellow"], [90, 120, "green"], [120, 130, "lightGreen"], [130, 140, "yellow"], [140, 180, "red"]] },
        { group: 0, key: "BP_DIASTOLIC", name: ["Diastolic Blood Pressure", "舒张压"], decimals: 0, unit: "mmHg", range: "60 - 80 mmHg", segments: [[30, 60, "yellow"], [60, 70, "green"], [70, 80, "lightGreen"], [80, 90, "yellow"], [90, 120, "red"]] },
        { group: 0, key: "BODY_TEMPERATURE", aliases: ["TEMPERATURE_SENSOR"], name: ["Body Temperature", "体温"], decimals: 1, unit: "°C", range: "36.5 - 37.5 °C", segments: [[35, 36.5, "lightGreen"], [36.5, 37.5, "green"], [37.5, 40, "yellow"], [40, 41.5, "lightRed"]] },
        { group: 1, key: "HRV_SDNN", name: ["Heart Rate Variability", "心率变异性"], decimals: 1, unit: "ms", range: "35.5 - 80 ms", segments: [[1.1, 10.8, "red"], [10.8, 16.4, "lightRed"], [16.4, 35.5, "yellow"], [35.5, 51.5, "lightGreen"], [51.5, 80, "green"]] },
        { group: 1, key: "BP_RPP", name: ["Cardiac Workload", "心脏负荷"], decimals: 2, unit: "dB", range: "3.71 - 3.90 dB", segments: [[3.71, 3.8, "green"], [3.8, 3.9, "lightGreen"], [3.9, 4.08, "yellow"], [4.08, 4.18, "lightRed"], [4.18, 4.28, "red"]] },
        { group: 2, key: "MSI", name: ["Mental Stress Index", "精神压力指数"], decimals: 1, unit: "", risk: true, segments: [[1, 2, "green"], [2, 3, "lightGreen"], [3, 4, "yellow"], [4, 5, "lightRed"], [5, 6, "red"]] },
        { group: 3, key: "AGE", aliases: ["FACIAL_SKIN_AGE"], name: ["Facial Skin Age", "面部皮肤年龄"], decimals: 0, unit: "years", range: "18 - 120 years" },
        { group: 3, key: "BMI_CALC", name: ["Body Mass Index", "体重指数 BMI"], decimals: 0, unit: "kg/m²", range: "18 - 25 kg/m²", segments: [[10, 18.5, "yellow"], [18.5, 25, "green"], [25, 30, "yellow"], [30, 35, "lightRed"], [35, 60, "red"]] },
        { group: 3, key: "WAIST_TO_HEIGHT", name: ["Waist-to-Height Ratio", "腰围身高比"], decimals: 0, unit: "%", range: "43 - 53%", segments: [[25, 43, "yellow"], [43, 53, "green"], [53, 58, "yellow"], [58, 63, "lightRed"], [63, 75, "red"]] },
        { group: 3, key: "ABSI", name: ["Body Shape Index", "体型指数"], decimals: 2, unit: "", range: "6.60 - 7.60", segments: [[6.6, 7.1, "green"], [7.1, 7.6, "lightGreen"], [7.6, 8.6, "yellow"], [8.6, 9.1, "lightRed"], [9.1, 9.6, "red"]] },
        { group: 4, key: "BP_CVD", name: ["Cardiovascular Disease Likelihood", "心血管疾病可能性"], decimals: 0, unit: "%", risk: true, segments: riskSegments(5, 7.25, 10, 20) },
        { group: 4, key: "BP_HEART_ATTACK", name: ["Heart Attack Risk", "心脏病风险"], decimals: 0, unit: "%", risk: true, segments: riskSegments(1.65, 2.39, 3.3, 6.6, 33) },
        { group: 4, key: "BP_STROKE", name: ["Stroke Risk", "中风风险"], decimals: 0, unit: "%", risk: true, segments: riskSegments(3.3, 4.79, 6.6, 13.2, 66) },
        { group: 5, key: "OVERALL_METABOLIC_RISK_PROB", name: ["Overall Metabolic Health Risk", "整体代谢健康风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 5, key: "HPT_RISK_PROB", name: ["Hypertension Risk", "高血压风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 5, key: "DBT_RISK_PROB", name: ["Type 2 Diabetes Risk", "2 型糖尿病风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 5, key: "HDLTC_RISK_PROB", name: ["Hypercholesterolemia Risk", "高胆固醇血症风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 5, key: "TG_RISK_PROB", name: ["Hypertriglyceridemia Risk", "高甘油三酯血症风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 5, key: "FLD_RISK_PROB", name: ["Fatty Liver Disease Risk", "脂肪肝风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 6, key: "HBA1C_RISK_PROB", name: ["Risk of HbA1c Level > 5.7%", "糖化血红蛋白水平高于5.7%的风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() },
        { group: 6, key: "MFBG_RISK_PROB", name: ["Risk of Fasting Blood Glucose Level > 5.5 mmol/L", "空腹血糖水平高于5.5mmol/L的风险"], decimals: 0, unit: "%", risk: true, segments: standardRiskSegments() }
    ];

    function standardRiskSegments() {
        return riskSegments(25, 45, 55, 75, 100);
    }

    function riskSegments(a, b, c, d, max = 100) {
        return [[0, a, "green"], [a, b, "lightGreen"], [b, c, "yellow"], [c, d, "lightRed"], [d, max, "red"]];
    }

    function languageFor(locale) {
        return String(locale || navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
    }

    function valueFor(results, definition) {
        if (Number.isFinite(Number(results[definition.key]))) return Number(results[definition.key]);
        for (const alias of definition.aliases || []) {
            if (Number.isFinite(Number(results[alias]))) return Number(results[alias]);
        }
        return null;
    }

    function segmentFor(value, segments) {
        if (!segments) return "";
        for (let index = 0; index < segments.length; index += 1) {
            const [min, max, color] = segments[index];
            if (value >= min && value <= max) return color;
        }
        return "";
    }

    function formatValue(value, definition, locale) {
        const number = new Intl.NumberFormat(locale, {
            minimumFractionDigits: definition.decimals,
            maximumFractionDigits: definition.decimals
        }).format(value);
        return definition.unit ? `${number} ${definition.unit}` : number;
    }

    function render(payload) {
        const results = payload && payload.results ? payload.results : payload || {};
        const language = languageFor(payload && payload.locale);
        const text = copy[language];
        const locale = payload && payload.locale ? payload.locale : language;
        document.documentElement.lang = language;
        document.title = text.title;
        document.getElementById("reportTitle").textContent = text.title;
        document.getElementById("closeButton").textContent = text.back;
        document.getElementById("printButton").textContent = text.print;
        document.getElementById("loading").textContent = text.loading;
        document.getElementById("disclaimerText").textContent = text.disclaimer;

        const generatedAt = Number(payload && payload.generatedAt) || Date.now();
        document.getElementById("timestamp").textContent = new Intl.DateTimeFormat(locale, {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        }).format(new Date(generatedAt));

        const meta = document.getElementById("measurementMeta");
        const measurementId = payload && payload.measurementId;
        const snr = Number(results.SNR);
        if (measurementId || Number.isFinite(snr)) {
            meta.hidden = false;
            document.getElementById("measurementId").textContent = measurementId ? `${text.measurement}: ${measurementId}` : "";
            document.getElementById("quality").textContent = Number.isFinite(snr) ? `${text.quality}: ${snr.toFixed(1)} dB` : "";
        }

        const sections = document.getElementById("sections");
        sections.replaceChildren();
        let renderedRows = 0;
        for (let group = 0; group < text.groups.length; group += 1) {
            const rows = definitions.filter(item => item.group === group)
                .map(definition => ({ definition, value: valueFor(results, definition) }))
                .filter(item => item.value !== null);
            if (!rows.length) continue;

            const section = document.createElement("section");
            section.className = "report-section";
            const heading = document.createElement("h2");
            heading.textContent = text.groups[group];
            section.appendChild(heading);

            const table = document.createElement("table");
            table.className = "results-table";
            const thead = table.createTHead();
            const header = thead.insertRow();
            const showReferenceRange = ![2, 4, 5, 6].includes(group);
            [text.name, text.result, showReferenceRange ? text.range : ""].forEach(label => {
                const cell = document.createElement("th");
                cell.scope = "col";
                cell.textContent = label;
                header.appendChild(cell);
            });
            const tbody = table.createTBody();
            rows.forEach(({ definition, value }) => {
                const row = tbody.insertRow();
                row.insertCell().textContent = definition.name[language === "zh" ? 1 : 0];
                const color = segmentFor(value, definition.segments);
                const valueCell = row.insertCell();
                valueCell.className = `result-value${color ? ` status-${color}` : ""}`;
                if (definition.risk && color) {
                    const statusIndex = ["green", "lightGreen", "yellow", "lightRed", "red"].indexOf(color);
                    valueCell.textContent = text.status[statusIndex];
                } else {
                    valueCell.textContent = formatValue(value, definition, locale);
                }
                row.insertCell().textContent = definition.risk ? "" : (definition.range || "");
                renderedRows += 1;
            });
            section.appendChild(table);
            sections.appendChild(section);
        }

        document.getElementById("loading").hidden = renderedRows > 0;
        document.getElementById("error").hidden = true;
        document.getElementById("disclaimer").hidden = renderedRows === 0;
        document.getElementById("report").setAttribute("aria-busy", "false");
        if (!renderedRows) showError(text.missing);
    }

    function showError(message) {
        document.getElementById("loading").hidden = true;
        const error = document.getElementById("error");
        error.textContent = message;
        error.hidden = false;
        document.getElementById("report").setAttribute("aria-busy", "false");
    }

    function requestPrint() {
        window.print();
    }

    function requestClose() {
        if (history.length > 1) history.back();
    }

    function crc16(value) {
        let crc = 0xffff;
        for (const character of value) {
            crc ^= character.charCodeAt(0);
            for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
        }
        return crc & 0xffff;
    }

    function halfToNumber(bits) {
        const sign = (bits & 0x8000) ? -1 : 1;
        const exponent = (bits >>> 10) & 0x1f;
        const fraction = bits & 0x03ff;
        if (exponent === 0) return sign * Math.pow(2, -14) * (fraction / 1024);
        if (exponent === 31) return fraction ? NaN : sign * Infinity;
        return sign * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
    }

    function decodeNuraQr(encoded) {
        const normalized = decodeURIComponent(encoded).replace(/\s/g, "+");
        const raw = atob(normalized);
        const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
        if (bytes.length < 7 || String.fromCharCode(...bytes.slice(0, 3)) !== "NQ1") throw new Error("Unsupported report payload");
        const view = new DataView(bytes.buffer);
        const timestampDigits = String(view.getUint32(3, true)).padStart(10, "0");
        const year = 2000 + Number(timestampDigits.slice(0, 2));
        const month = Number(timestampDigits.slice(2, 4)) - 1;
        const day = Number(timestampDigits.slice(4, 6));
        const hour = Number(timestampDigits.slice(6, 8));
        const minute = Number(timestampDigits.slice(8, 10));
        const keys = new Set(["SNR", "STAR_RATING", ...definitions.flatMap(item => [item.key, ...(item.aliases || [])])]);
        const hashes = new Map([...keys].map(key => [crc16(key), key]));
        const results = {};
        for (let offset = 7; offset + 3 < bytes.length; offset += 4) {
            const key = hashes.get(view.getUint16(offset, true));
            const value = halfToNumber(view.getUint16(offset + 2, true));
            if (key && Number.isFinite(value)) results[key] = value;
        }
        const query = new URLSearchParams(location.search);
        return {
            schemaVersion: 1,
            measurementId: query.get("mid") || "",
            partnerId: query.get("pid") || "",
            generatedAt: new Date(year, month, day, hour, minute).getTime(),
            locale: navigator.language,
            results
        };
    }

    window.renderMeasurementReport = render;
    document.getElementById("printButton").addEventListener("click", requestPrint);
    document.getElementById("closeButton").addEventListener("click", requestClose);
    document.addEventListener("DOMContentLoaded", () => {
        const query = new URLSearchParams(location.search);
        const encoded = query.get("r");
        if (!encoded && query.get("demo") === "1") {
            render({
                schemaVersion: 1,
                measurementId: "demo-measurement",
                generatedAt: Date.now(),
                locale: query.get("locale") || navigator.language,
                results: {
                    SNR: 7.8, HR_BPM: 72, IHB_COUNT: 0, BR_BPM: 15,
                    BP_SYSTOLIC: 118, BP_DIASTOLIC: 76, BODY_TEMPERATURE: 36.7,
                    HRV_SDNN: 48.6, BP_RPP: 3.82, MSI: 2.6, AGE: 36,
                    BMI_CALC: 23, WAIST_TO_HEIGHT: 47, ABSI: 7.38,
                    BP_CVD: 4, BP_HEART_ATTACK: 1.2, BP_STROKE: 2.8,
                    OVERALL_METABOLIC_RISK_PROB: 18, HPT_RISK_PROB: 22,
                    DBT_RISK_PROB: 31, HDLTC_RISK_PROB: 28, TG_RISK_PROB: 41,
                    FLD_RISK_PROB: 20, HBA1C_RISK_PROB: 24, MFBG_RISK_PROB: 32
                }
            });
            return;
        }
        if (!encoded) return;
        try {
            render(decodeNuraQr(encoded));
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error));
        }
    });
})();
