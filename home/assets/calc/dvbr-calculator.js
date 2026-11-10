/* Калькулятор клиента «Восточный Брокер» v6.3 — оригинал из Downloads/DVBR_CALCULATOR_EMBED_BRAND.html, логика не менялась */

/* rates.js */
const VERIFIED_AT = '2026-10-12';
const CALCULATION_VALID_THROUGH = '2026-12-31';

const SOURCES = {
  decision107: {
    title: 'Решение Совета ЕЭК от 20.12.2017 № 107, приложение № 2',
    url: 'https://eec.eaeunion.org/upload/medialibrary/48d/754bnati3u804penijmb0h866e5g6cng/Prilozhenie-2_107.pdf',
    verifiedAt: VERIFIED_AT,
  },
  customsFees: {
    title: 'Постановление Правительства РФ от 28.11.2024 № 1637; изменения по Постановлению от 23.10.2025 № 1638 с 01.01.2026',
    url: 'https://government.ru/docs/all/161517/',
    verifiedAt: VERIFIED_AT,
  },
  recycling: {
    title: 'Постановление Правительства РФ от 26.12.2013 № 1291; Постановление Правительства РФ от 01.11.2025 № 1713',
    url: 'https://publication.pravo.gov.ru/document/0001202511010019',
    verifiedAt: VERIFIED_AT,
  },
  excise: {
    title: 'НК РФ, статья 193 (ставки акцизов на 2026 год)',
    url: 'https://www.consultant.ru/document/cons_doc_LAW_28165/',
    verifiedAt: VERIFIED_AT,
  },
  vat: {
    title: 'НК РФ, статьи 164 и 160; стандартная ставка НДС 22% с 01.01.2026',
    url: 'https://www.nalog.gov.ru/',
    verifiedAt: VERIFIED_AT,
  },
  powerConversion: {
    title: 'ФНС России — перевод мощности из кВт в л.с. и учёт мощности гибридов',
    url: 'https://www.nalog.gov.ru/rn20/news/activities_fts/16393705/',
    verifiedAt: VERIFIED_AT,
  },
  cbr: {
    title: 'Банк России — официальные курсы валют',
    url: 'https://www.cbr.ru/scripts/XML_daily.asp',
    verifiedAt: VERIFIED_AT,
  },
};

const VAT_RATE_2026 = {
  value: 0.22,
  unit: 'доля',
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  legalAct: 'НК РФ, ст. 164 и 160',
  source: SOURCES.vat,
};

const CUSTOMS_FEES_2026 = [
  { max: 200_000, fee: 1_231 },
  { max: 450_000, fee: 2_462 },
  { max: 1_200_000, fee: 4_924 },
  { max: 2_700_000, fee: 13_541 },
  { max: 4_200_000, fee: 18_465 },
  { max: 5_500_000, fee: 21_344 },
  { max: 10_000_000, fee: 49_240 },
  { max: Infinity, fee: 73_860 },
].map((row) => ({
  ...row,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  legalAct: 'Постановление Правительства РФ от 28.11.2024 № 1637, в ред. Постановления от 23.10.2025 № 1638',
  source: SOURCES.customsFees,
}));

// Единые ставки таможенных пошлин, налогов для физлица, ввозящего легковой автомобиль
// для личного пользования. Для чистого EV (8703 80 000) эта таблица НЕ применяется.
const PERSONAL_UNIFIED_DUTY = {
  upTo3Years: [
    { maxEur: 8_500, percent: 0.54, minEurPerCc: 2.5 },
    { maxEur: 16_700, percent: 0.48, minEurPerCc: 3.5 },
    { maxEur: 42_300, percent: 0.48, minEurPerCc: 5.5 },
    { maxEur: 84_500, percent: 0.48, minEurPerCc: 7.5 },
    { maxEur: 169_000, percent: 0.48, minEurPerCc: 15 },
    { maxEur: Infinity, percent: 0.48, minEurPerCc: 20 },
  ],
  from3To5Years: [
    { maxCc: 1_000, eurPerCc: 1.5 },
    { maxCc: 1_500, eurPerCc: 1.7 },
    { maxCc: 1_800, eurPerCc: 2.5 },
    { maxCc: 2_300, eurPerCc: 2.7 },
    { maxCc: 3_000, eurPerCc: 3.0 },
    { maxCc: Infinity, eurPerCc: 3.6 },
  ],
  over5Years: [
    { maxCc: 1_000, eurPerCc: 3.0 },
    { maxCc: 1_500, eurPerCc: 3.2 },
    { maxCc: 1_800, eurPerCc: 3.5 },
    { maxCc: 2_300, eurPerCc: 4.8 },
    { maxCc: 3_000, eurPerCc: 5.0 },
    { maxCc: Infinity, eurPerCc: 5.7 },
  ],
  effectiveFrom: '2018-01-01',
  source: SOURCES.decision107,
};

// Для чистого электромобиля и последовательного гибрида в контрольных расчётах TKS/Alta
// применяется отдельная ветка СТП: ввозная пошлина 15%, затем акциз и НДС.
// Последовательный гибрид в части расчётов приравнивается к электромобилю;
// значение 15% сверено по предоставленным пользователем контрольным расчётам на 08.09.2026.
const PERSONAL_EV_STP_DUTY_2026 = {
  percent: 15,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  legalAct: 'СТП для EV/последовательной гибридной установки; ставка 15% сверена по контрольным расчётам TKS/Alta',
  source: {
    title: 'TKS/Alta — контрольная механика EV и последовательного гибрида',
    url: 'https://www.tks.ru/auto/calc/',
    verifiedAt: VERIFIED_AT,
  },
};

const EXCISE_2026 = [
  { maxHp: 90, rubPerHp: 0 },
  { maxHp: 150, rubPerHp: 64 },
  { maxHp: 200, rubPerHp: 613 },
  { maxHp: 300, rubPerHp: 1_004 },
  { maxHp: 400, rubPerHp: 1_711 },
  { maxHp: 500, rubPerHp: 1_771 },
  { maxHp: Infinity, rubPerHp: 1_829 },
].map((row) => ({
  ...row,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  legalAct: 'НК РФ, ст. 193',
  source: SOURCES.excise,
}));

const RECYCLING_BASE_M1 = {
  value: 20_000,
  unit: 'RUB',
  effectiveFrom: '2025-12-01',
  legalAct: 'Постановление Правительства РФ № 1291',
  source: SOURCES.recycling,
};

const BAND = (maxKw, newCoeff, oldCoeff) => ({ maxKw, newCoeff, oldCoeff });

// EV + последовательные гибриды: мощность = 30-минутная мощность тягового электродвигателя(ей).
const UTIL_EV_GENERAL_2026 = [
  BAND(58.84, 40.04, 70.44),
  BAND(73.55, 49.56, 82.08),
  BAND(95.61, 65.88, 95.64),
  BAND(117.68, 78.00, 111.36),
  BAND(139.75, 92.40, 129.72),
  BAND(161.81, 109.68, 151.20),
  BAND(183.88, 129.96, 176.16),
  BAND(205.94, 153.96, 205.20),
  BAND(Infinity, 182.40, 239.04),
];

// ДВС, обычные/параллельные и plug-in гибриды.
// Для гибридов мощность для утильсбора определяется по правилам Постановления №1291.
const UTIL_ICE_GENERAL_2026 = {
  upTo1000: [
    BAND(117.68, 14.88, 27.60),
    BAND(139.75, 15.36, 28.43),
    BAND(161.81, 15.84, 29.28),
    BAND(183.88, 16.20, 30.12),
    BAND(Infinity, 17.28, 30.12),
  ],
  upTo2000: [
    BAND(117.68, 40.04, 70.44),
    BAND(139.75, 45.00, 74.64),
    BAND(161.81, 47.64, 79.20),
    BAND(183.88, 50.52, 83.88),
    BAND(205.94, 57.12, 91.92),
    BAND(228.00, 64.56, 100.56),
    BAND(250.07, 72.96, 110.16),
    BAND(272.13, 83.16, 120.60),
    BAND(294.20, 94.80, 132.00),
    BAND(316.26, 108.00, 144.60),
    BAND(338.33, 123.24, 158.40),
    BAND(367.75, 140.40, 173.40),
    BAND(Infinity, 160.08, 189.84),
  ],
  upTo3000: [
    BAND(117.68, 112.52, 170.36),
    BAND(139.75, 115.34, 172.80),
    BAND(161.81, 118.20, 175.08),
    BAND(183.88, 120.12, 177.60),
    BAND(205.94, 126.00, 183.00),
    BAND(228.00, 131.04, 188.52),
    BAND(250.07, 136.32, 193.68),
    BAND(272.13, 141.72, 199.08),
    BAND(294.20, 147.48, 204.72),
    BAND(316.26, 153.36, 210.48),
    BAND(338.33, 159.48, 216.36),
    BAND(367.75, 165.84, 222.36),
    BAND(Infinity, 172.44, 228.60),
  ],
  upTo3500: [
    BAND(117.68, 129.20, 197.81),
    BAND(139.75, 131.76, 200.04),
    BAND(161.81, 134.40, 202.20),
    BAND(183.88, 137.16, 204.36),
    BAND(205.94, 140.52, 207.24),
    BAND(228.00, 144.00, 212.40),
    BAND(250.07, 151.92, 217.80),
    BAND(272.13, 160.32, 224.28),
    BAND(294.20, 169.20, 231.00),
    BAND(316.26, 178.44, 237.96),
    BAND(338.33, 188.28, 245.04),
    BAND(367.75, 198.60, 252.48),
    BAND(Infinity, 209.52, 260.04),
  ],
  over3500: [
    BAND(117.68, 164.53, 216.29),
    BAND(139.75, 167.28, 219.48),
    BAND(161.81, 170.16, 222.84),
    BAND(183.88, 173.04, 226.20),
    BAND(205.94, 176.52, 231.36),
    BAND(228.00, 180.00, 236.64),
    BAND(250.07, 186.36, 249.60),
    BAND(272.13, 192.88, 263.40),
    BAND(294.20, 199.68, 277.92),
    BAND(316.26, 206.64, 293.16),
    BAND(338.33, 213.84, 309.36),
    BAND(367.75, 221.28, 326.40),
    BAND(Infinity, 229.08, 344.28),
  ],
};

// Для физлица для личного пользования льготные коэффициенты применяются только при
// соблюдении условий и в установленных мощностных/объёмных диапазонах.
const PERSONAL_UTIL_PREFERENTIAL = {
  newCoeff: 0.17,
  oldCoeff: 0.26,
  iceMaxKw: 117.68,
  iceMaxCc: 3_000,
  evMaxKw: 58.84,
  legalAct: 'Постановление Правительства РФ №1291 в ред. Постановления №1713',
  source: SOURCES.recycling,
};

const RATE_METADATA = {
  verifiedAt: VERIFIED_AT,
  note: 'Ставки отделены от расчётной логики. Перед применением в продакшене перепроверьте действующую редакцию НПА на дату декларации.',
};

/* calculator.js */
const KW_PER_HP_FOR_EXCISE = 0.75;
const KW_TO_HP = 1 / KW_PER_HP_FOR_EXCISE;

class CalculationError extends Error {
  constructor(message, field = null, code = 'CALCULATION_ERROR') {
    super(message);
    this.name = 'CalculationError';
    this.field = field;
    this.code = code;
  }
}

const money = (value) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value ?? 0) + ' ₽';

const finitePositive = (v) => Number.isFinite(Number(v)) && Number(v) > 0;
const finiteNonNegative = (v) => Number.isFinite(Number(v)) && Number(v) >= 0;
const round = (value, digits = 2) => {
  const p = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * p) / p;
};

function isSeriesHybrid(input = {}) {
  return input.engineType === 'series_hybrid' ||
    (Boolean(input.seriesPowertrain) && ['hybrid', 'plugin_hybrid'].includes(input.engineType));
}

function kwToHp(powerKw) {
  if (!finiteNonNegative(powerKw)) throw new CalculationError('Мощность в кВт должна быть неотрицательной.', 'powerKw');
  return round(Number(powerKw) / KW_PER_HP_FOR_EXCISE, 2);
}

function calculateCurrencyConversion(amount, rubPerUnit) {
  if (!finitePositive(amount)) throw new CalculationError('Стоимость автомобиля должна быть больше нуля.', 'price');
  if (!finitePositive(rubPerUnit)) throw new CalculationError('Курс валюты должен быть больше нуля.', 'exchangeRate');
  const result = Number(amount) * Number(rubPerUnit);
  return {
    amountRub: result,
    formula: `${amount} × ${rubPerUnit} RUB`,
  };
}

function calculateCustomsValue({ priceRub, additionsRub = 0 }) {
  if (!finitePositive(priceRub)) throw new CalculationError('Стоимость автомобиля в рублях должна быть больше нуля.', 'price');
  if (!finiteNonNegative(additionsRub)) throw new CalculationError('Дополнительные включаемые расходы не могут быть отрицательными.', 'additionsRub');
  const amount = Number(priceRub) + Number(additionsRub);
  return {
    amount,
    formula: `${priceRub} + ${additionsRub}`,
    explanation: 'Стоимость автомобиля + только те расходы/добавления, которые подлежат включению в таможенную стоимость.',
  };
}

function determineAgeCategory(productionMonth, declarationDate) {
  if (!productionMonth) throw new CalculationError('Укажите месяц и год выпуска.', 'productionMonth');
  if (!declarationDate) throw new CalculationError('Укажите дату расчёта/декларации.', 'declarationDate');

  const [year, month] = productionMonth.split('-').map(Number);
  const d = new Date(`${declarationDate}T12:00:00`);
  if (!year || !month || Number.isNaN(d.getTime())) throw new CalculationError('Некорректная дата выпуска или декларации.');

  const months = (d.getFullYear() - year) * 12 + (d.getMonth() + 1 - month);
  if (months < 0) throw new CalculationError('Дата выпуска не может находиться в будущем.', 'productionMonth');
  if (months === 36 || months === 60) {
    throw new CalculationError(
      'Возраст находится ровно на границе 3/5 лет. Месяца выпуска недостаточно для достоверной категории — уточните точную дату выпуска по документам.',
      'productionMonth',
      'AGE_BOUNDARY_AMBIGUOUS',
    );
  }
  if (months < 36) return { code: 'UP_TO_3', label: 'до 3 лет', months };
  if (months < 60) return { code: 'FROM_3_TO_5', label: 'от 3 до 5 лет', months };
  return { code: 'OVER_5', label: 'старше 5 лет', months };
}

function selectBand(rows, value, key = 'maxKw') {
  const row = rows.find((r) => Number(value) <= r[key]);
  if (!row) throw new CalculationError('Не найден тарифный диапазон.');
  return row;
}

function calculatePersonalUnifiedDuty({ customsValueRub, eurRub, engineCc, ageCategory }) {
  if (!finitePositive(customsValueRub)) throw new CalculationError('Не определена таможенная стоимость.', 'customsValue');
  if (!finitePositive(eurRub)) throw new CalculationError('Нужен официальный/ручной курс EUR/RUB на дату расчёта.', 'eurRub');
  if (!finitePositive(engineCc)) throw new CalculationError('Для расчёта единой ставки укажите объём двигателя, см³.', 'engineCc');

  const cvEur = Number(customsValueRub) / Number(eurRub);
  let amountEur;
  let formula;
  let tariffText;

  if (ageCategory.code === 'UP_TO_3') {
    const row = selectBand(PERSONAL_UNIFIED_DUTY.upTo3Years, cvEur, 'maxEur');
    const byPercent = cvEur * row.percent;
    const byCc = Number(engineCc) * row.minEurPerCc;
    amountEur = Math.max(byPercent, byCc);
    formula = `max(${cvEur.toFixed(2)} EUR × ${(row.percent * 100).toFixed(0)}%; ${engineCc} см³ × ${row.minEurPerCc} EUR/см³)`;
    tariffText = `${(row.percent * 100).toFixed(0)}% таможенной стоимости, но не менее ${row.minEurPerCc} EUR/см³`;
  } else {
    const table = ageCategory.code === 'FROM_3_TO_5'
      ? PERSONAL_UNIFIED_DUTY.from3To5Years
      : PERSONAL_UNIFIED_DUTY.over5Years;
    const row = selectBand(table, Number(engineCc), 'maxCc');
    amountEur = Number(engineCc) * row.eurPerCc;
    formula = `${engineCc} см³ × ${row.eurPerCc} EUR/см³`;
    tariffText = `${row.eurPerCc} EUR/см³`;
  }

  return {
    amount: amountEur * Number(eurRub),
    amountEur,
    formula,
    tariff: tariffText,
    customsValueEur: cvEur,
    legalAct: SOURCES.decision107.title,
    source: SOURCES.decision107.url,
    verifiedAt: VERIFIED_AT,
    kind: 'unified_personal_payment',
    note: 'Это единая ставка таможенных пошлин, налогов. НДС и акциз в этом маршруте отдельно поверх неё не начисляются.',
  };
}

function calculatePersonalEvStpDuty({ customsValueRub }) {
  if (!finitePositive(customsValueRub)) throw new CalculationError('Не определена таможенная стоимость.', 'customsValue');
  const percent = PERSONAL_EV_STP_DUTY_2026.percent;
  return {
    amount: Number(customsValueRub) * percent / 100,
    formula: `${customsValueRub} × ${percent}%`,
    tariff: `${percent}% таможенной стоимости`,
    legalAct: PERSONAL_EV_STP_DUTY_2026.legalAct,
    source: PERSONAL_EV_STP_DUTY_2026.source.url,
    verifiedAt: VERIFIED_AT,
    kind: 'ev_aggregate_payment',
    note: 'Для этой ветки акциз и НДС рассчитываются отдельно. НДС-база = таможенная стоимость + пошлина + акциз.',
  };
}

function calculateVerifiedTariffDuty({ customsValueRub, engineCc, eurRub, tariff }) {
  if (!tariff?.verified) {
    throw new CalculationError(
      'Для этого маршрута требуется подтверждённая ставка ввозной пошлины по точному коду ТН ВЭД. Итог намеренно не рассчитывается приблизительно.',
      'tariff',
      'VERIFIED_TARIFF_REQUIRED',
    );
  }
  if (!tariff.tnved || String(tariff.tnved).replace(/\D/g, '').length !== 10) {
    throw new CalculationError('Укажите подтверждённый 10-значный код ТН ВЭД.', 'tnved');
  }
  if (!tariff.source || !tariff.legalAct) {
    throw new CalculationError('Для ручной тарифной ставки укажите источник и нормативное основание.', 'tariffSource');
  }

  const rule = tariff.rule;
  let amount;
  let formula;
  if (rule === 'percent') {
    if (!finiteNonNegative(tariff.percent)) throw new CalculationError('Некорректная процентная ставка пошлины.', 'dutyPercent');
    amount = Number(customsValueRub) * Number(tariff.percent) / 100;
    formula = `${customsValueRub} × ${tariff.percent}%`;
  } else if (rule === 'max_percent_min_eurcc') {
    if (!finiteNonNegative(tariff.percent) || !finitePositive(tariff.eurPerCc) || !finitePositive(engineCc) || !finitePositive(eurRub)) {
      throw new CalculationError('Для правила «%, но не менее EUR/см³» нужны %, EUR/см³, объём двигателя и EUR/RUB.');
    }
    const byPercent = Number(customsValueRub) * Number(tariff.percent) / 100;
    const byCc = Number(engineCc) * Number(tariff.eurPerCc) * Number(eurRub);
    amount = Math.max(byPercent, byCc);
    formula = `max(${customsValueRub} × ${tariff.percent}%; ${engineCc} × ${tariff.eurPerCc} EUR/см³ × ${eurRub})`;
  } else if (rule === 'specific_eurcc') {
    if (!finitePositive(tariff.eurPerCc) || !finitePositive(engineCc) || !finitePositive(eurRub)) {
      throw new CalculationError('Для специфической ставки нужны EUR/см³, объём двигателя и EUR/RUB.');
    }
    amount = Number(engineCc) * Number(tariff.eurPerCc) * Number(eurRub);
    formula = `${engineCc} × ${tariff.eurPerCc} EUR/см³ × ${eurRub}`;
  } else {
    throw new CalculationError('Не выбран способ расчёта подтверждённой ставки пошлины.', 'dutyRule');
  }

  return {
    amount,
    formula,
    tariff: tariff.label || 'Подтверждённая пользователем ставка по ТН ВЭД',
    tnved: tariff.tnved,
    legalAct: tariff.legalAct,
    source: tariff.source,
    verifiedAt: tariff.verifiedAt || 'проверено пользователем на дату декларации',
    kind: 'standard_import_duty',
  };
}

function calculateImportDuty(input) {
  const isPersonalPhysical = input.importer === 'physical' && input.purpose === 'personal';
  const isPureEv = input.engineType === 'electric';
  const seriesHybrid = isSeriesHybrid(input);
  if (isPersonalPhysical && (isPureEv || seriesHybrid)) {
    const duty = calculatePersonalEvStpDuty(input);
    if (seriesHybrid) {
      duty.note = 'Последовательная гибридная силовая установка: для личного ввоза применяется отдельная ветка СТП, аналогичная электромобилю; акциз и НДС рассчитываются отдельно.';
      duty.kind = 'series_hybrid_aggregate_payment';
    }
    return duty;
  }
  if (isPersonalPhysical) return calculatePersonalUnifiedDuty(input);
  return calculateVerifiedTariffDuty(input);
}

function calculateCustomsFee(customsValueRub) {
  if (!finitePositive(customsValueRub)) throw new CalculationError('Не определена таможенная стоимость.', 'customsValue');
  const row = CUSTOMS_FEES_2026.find((r) => Number(customsValueRub) <= r.max);
  const minPrevious = CUSTOMS_FEES_2026[CUSTOMS_FEES_2026.indexOf(row) - 1]?.max ?? 0;
  return {
    amount: row.fee,
    formula: `Шкала по таможенной стоимости ${customsValueRub} RUB`,
    range: row.max === Infinity ? `свыше ${minPrevious} RUB` : `${minPrevious}–${row.max} RUB`,
    tariff: `${row.fee} RUB`,
    legalAct: row.legalAct,
    source: row.source.url,
    verifiedAt: VERIFIED_AT,
  };
}

function calculateExcise(powerKw) {
  if (!finiteNonNegative(powerKw)) throw new CalculationError('Для акциза укажите мощность в кВт.', 'excisePowerKw');
  const powerHp = kwToHp(powerKw);
  const row = selectBand(EXCISE_2026, powerHp, 'maxHp');
  return {
    amount: powerHp * row.rubPerHp,
    powerKw: Number(powerKw),
    powerHp,
    formula: `${powerKw} кВт ÷ 0,75 кВт/л.с. = ${powerHp} л.с.; ${powerHp} л.с. × ${row.rubPerHp} RUB/л.с.`,
    tariff: `${row.rubPerHp} RUB/л.с.`,
    legalAct: row.legalAct,
    source: row.source.url,
    verifiedAt: VERIFIED_AT,
  };
}

function calculateVAT({ customsValueRub, dutyRub, exciseRub }) {
  for (const [field, value] of Object.entries({ customsValueRub, dutyRub, exciseRub })) {
    if (!finiteNonNegative(value)) throw new CalculationError(`Некорректное значение ${field} для базы НДС.`);
  }
  const base = Number(customsValueRub) + Number(dutyRub) + Number(exciseRub);
  return {
    amount: base * VAT_RATE_2026.value,
    taxBase: base,
    formula: `(${customsValueRub} + ${dutyRub} + ${exciseRub}) × 22%`,
    tariff: '22%',
    legalAct: VAT_RATE_2026.legalAct,
    source: VAT_RATE_2026.source.url,
    verifiedAt: VERIFIED_AT,
  };
}

function calculateUtilPowerKw({ engineType, icePowerKw, electric30MinKw, utilPowerKwOverride, seriesPowertrain = false }) {
  if (finitePositive(utilPowerKwOverride)) {
    return { value: Number(utilPowerKwOverride), formula: 'Документированная мощность для утильсбора (ручной ввод), кВт.' };
  }

  const seriesHybrid = isSeriesHybrid({ engineType, seriesPowertrain });
  if (engineType === 'electric' || seriesHybrid) {
    if (!finitePositive(electric30MinKw)) {
      throw new CalculationError('Для электромобиля/последовательного гибрида укажите максимальную 30-минутную мощность тягового электродвигателя(ей), кВт.', 'electric30MinKw');
    }
    return {
      value: Number(electric30MinKw),
      formula: seriesHybrid
        ? `${electric30MinKw} кВт — мощность ЭД; ДВС последовательного гибрида не суммируется с ЭД для этой ветки`
        : `${electric30MinKw} кВт — максимальная 30-минутная мощность ЭД`,
    };
  }

  if (engineType === 'hybrid' || engineType === 'plugin_hybrid') {
    if (!finitePositive(icePowerKw) || !finitePositive(electric30MinKw)) {
      throw new CalculationError('Для гибрида укажите мощность ДВС в кВт и максимальную 30-минутную мощность электродвигателя(ей) в кВт.', 'electric30MinKw');
    }
    const value = Number(icePowerKw) + Number(electric30MinKw);
    return { value, formula: `${icePowerKw} кВт ДВС + ${electric30MinKw} кВт ЭД = ${round(value, 4)} кВт` };
  }

  if (!finitePositive(icePowerKw)) throw new CalculationError('Для утильсбора укажите мощность ДВС, кВт.', 'icePowerKw');
  return { value: Number(icePowerKw), formula: `${icePowerKw} кВт — мощность ДВС` };
}

function utilAgeCoeff(row, ageCategory) {
  return ageCategory.code === 'UP_TO_3' ? row.newCoeff : row.oldCoeff;
}

function iceVolumeTable(engineCc) {
  const cc = Number(engineCc);
  if (cc <= 1_000) return UTIL_ICE_GENERAL_2026.upTo1000;
  if (cc <= 2_000) return UTIL_ICE_GENERAL_2026.upTo2000;
  if (cc <= 3_000) return UTIL_ICE_GENERAL_2026.upTo3000;
  if (cc <= 3_500) return UTIL_ICE_GENERAL_2026.upTo3500;
  return UTIL_ICE_GENERAL_2026.over3500;
}

function getGeneralRecyclingCoefficient(args) {
  const { engineType, engineCc, utilPowerKw, ageCategory } = args;
  const evLike = engineType === 'electric' || isSeriesHybrid(args);
  if (evLike) {
    const row = selectBand(UTIL_EV_GENERAL_2026, utilPowerKw, 'maxKw');
    return utilAgeCoeff(row, ageCategory);
  }
  if (!finitePositive(engineCc)) throw new CalculationError('Для утильсбора укажите объём двигателя, см³.', 'engineCc');
  const row = selectBand(iceVolumeTable(engineCc), utilPowerKw, 'maxKw');
  return utilAgeCoeff(row, ageCategory);
}

function getPersonalRecyclingCoefficient(args) {
  const { engineType, engineCc, utilPowerKw, ageCategory } = args;
  const low = ageCategory.code === 'UP_TO_3'
    ? PERSONAL_UTIL_PREFERENTIAL.newCoeff
    : PERSONAL_UTIL_PREFERENTIAL.oldCoeff;

  if (engineType === 'electric' || isSeriesHybrid(args)) {
    if (utilPowerKw <= PERSONAL_UTIL_PREFERENTIAL.evMaxKw) return low;
    return getGeneralRecyclingCoefficient(args);
  }

  if (!finitePositive(engineCc)) throw new CalculationError('Для утильсбора укажите объём двигателя, см³.', 'engineCc');
  if (Number(engineCc) <= PERSONAL_UTIL_PREFERENTIAL.iceMaxCc && utilPowerKw <= PERSONAL_UTIL_PREFERENTIAL.iceMaxKw) {
    return low;
  }

  if (Number(engineCc) <= 1_000 && utilPowerKw > 117.68 && utilPowerKw <= 139.75 && ageCategory.code !== 'UP_TO_3') {
    return 28.44;
  }
  return getGeneralRecyclingCoefficient(args);
}

function computeEaeuCorrection(correction) {
  const names = ['actualDuty', 'referenceDuty', 'actualVat', 'referenceVat', 'actualExcise', 'referenceExcise'];
  for (const name of names) {
    if (!finiteNonNegative(correction?.[name])) {
      throw new CalculationError(
        'Для автомобиля, ранее оформленного декларацией на товары в другой стране ЕАЭС, нужны подтверждённые фактически уплаченные и расчётные контрольные суммы пошлины, НДС и акциза.',
        'eaeuCorrection',
        'EAEU_CORRECTION_REQUIRED',
      );
    }
  }
  const ktp = Math.max(Number(correction.referenceDuty) - Number(correction.actualDuty), 0);
  const kvat = Math.max(Number(correction.referenceVat) - Number(correction.actualVat), 0);
  const ka = Math.max(Number(correction.referenceExcise) - Number(correction.actualExcise), 0);
  return { ktp, kvat, ka, total: ktp + kvat + ka };
}

function calculateRecyclingFee({
  importer,
  purpose,
  engineType,
  engineCc,
  icePowerKw,
  electric30MinKw,
  seriesPowertrain = false,
  utilPowerKwOverride,
  ageCategory,
  personalConditionsConfirmed,
  priorPersonalVehicleWithin12m,
  earlyDisposalWithin12m,
  customsClearancePlace = 'russia',
  eaeuCorrection,
}) {
  const power = calculateUtilPowerKw({ engineType, icePowerKw, electric30MinKw, utilPowerKwOverride, seriesPowertrain });
  const generalCoeff = getGeneralRecyclingCoefficient({ engineType, engineCc, utilPowerKw: power.value, ageCategory, seriesPowertrain });
  const isPersonal = importer === 'physical' && purpose === 'personal';
  const preferentialEligible = isPersonal && personalConditionsConfirmed && !priorPersonalVehicleWithin12m;
  const selectedCoeff = preferentialEligible
    ? getPersonalRecyclingCoefficient({ engineType, engineCc, utilPowerKw: power.value, ageCategory, seriesPowertrain })
    : generalCoeff;

  const baseAmount = RECYCLING_BASE_M1.value * selectedCoeff;
  const generalAmount = RECYCLING_BASE_M1.value * generalCoeff;
  let correction = { ktp: 0, kvat: 0, ka: 0, total: 0 };
  if (customsClearancePlace === 'other_eaeu') correction = computeEaeuCorrection(eaeuCorrection);

  let earlyDisposalTopUp = 0;
  if (preferentialEligible && earlyDisposalWithin12m) {
    earlyDisposalTopUp = Math.max(generalAmount - baseAmount, 0);
  }

  const amount = baseAmount + correction.total + earlyDisposalTopUp;
  return {
    amount,
    baseRate: RECYCLING_BASE_M1.value,
    coefficient: selectedCoeff,
    generalCoefficient: generalCoeff,
    standardFeeBeforeCorrections: baseAmount,
    generalFee: generalAmount,
    preferentialEligible,
    utilPowerKw: power.value,
    powerFormula: power.formula,
    eaeuCorrection: correction,
    earlyDisposalTopUp,
    formula: customsClearancePlace === 'other_eaeu'
      ? `${RECYCLING_BASE_M1.value} × ${selectedCoeff} + Ктп ${correction.ktp} + Кндс ${correction.kvat} + Ка ${correction.ka}${earlyDisposalTopUp ? ` + доплата ${earlyDisposalTopUp}` : ''}`
      : `${RECYCLING_BASE_M1.value} × ${selectedCoeff}${earlyDisposalTopUp ? ` + доплата при отчуждении ${earlyDisposalTopUp}` : ''}`,
    legalAct: 'Постановление Правительства РФ №1291 в действующей редакции; коэффициенты по Постановлению №1713',
    source: SOURCES.recycling.url,
    verifiedAt: VERIFIED_AT,
    warnings: [
      ...(!preferentialEligible && isPersonal ? ['Льготный коэффициент физлица не применён: не подтверждены все условия либо это не первый льготный автомобиль за 12 месяцев.'] : []),
      ...(earlyDisposalTopUp > 0 ? ['Учтена потенциальная/возникшая доплата до общеустановленного уровня из-за отчуждения ранее 12 месяцев.'] : []),
    ],
  };
}

function resolveExcisePowerKw(input) {
  if (finitePositive(input.excisePowerKw)) {
    return { value: Number(input.excisePowerKw), source: 'Мощность для акциза введена по документам.' };
  }
  if (input.engineType === 'petrol' || input.engineType === 'diesel') {
    if (!finitePositive(input.icePowerKw)) throw new CalculationError('Укажите мощность ДВС в кВт.', 'icePowerKw');
    return { value: Number(input.icePowerKw), source: 'Для ДВС использована указанная мощность двигателя.' };
  }
  if (input.engineType === 'electric') {
    if (!finitePositive(input.electric30MinKw)) throw new CalculationError('Укажите мощность электродвигателя в кВт.', 'electric30MinKw');
    return { value: Number(input.electric30MinKw), source: 'Для чистого EV в ветке СТП использована указанная мощность электродвигателя в кВт.' };
  }
  if (isSeriesHybrid(input)) {
    if (!finitePositive(input.electric30MinKw)) throw new CalculationError('Для последовательного гибрида укажите мощность электродвигателя в кВт.', 'electric30MinKw');
    return { value: Number(input.electric30MinKw), source: 'Для последовательного гибрида в ветке СТП использована мощность ЭД; ДВС выполняет генераторную функцию.' };
  }
  throw new CalculationError(
    'Для гибрида в маршруте с отдельным акцизом укажите документированную мощность, применяемую для акциза, в кВт.',
    'excisePowerKw',
    'EXCISE_POWER_REQUIRED',
  );
}

function validateCoreInput(input) {
  const errors = [];
  const push = (field, message) => errors.push({ field, message });
  if (input.countryImport !== 'RU') push('countryImport', 'Эта версия рассчитана для ввоза/уплаты в Российской Федерации.');
  if (input.goodsStatus === 'eaeu_goods') push('goodsStatus', 'Автомобиль уже имеет статус товара ЕАЭС: обычный расчёт ввоза из третьей страны неприменим.');
  if (!input.importer) push('importer', 'Укажите статус импортёра.');
  if (!input.purpose) push('purpose', 'Укажите цель ввоза.');
  if (!input.engineType) push('engineType', 'Укажите тип силовой установки.');
  if (!finitePositive(input.price)) push('price', 'Стоимость должна быть больше нуля.');
  if (!input.currency) push('currency', 'Укажите валюту сделки.');
  if (!finitePositive(input.exchangeRate)) push('exchangeRate', 'Не определён курс валюты к рублю.');
  if (!finitePositive(input.eurRub)) push('eurRub', 'Не определён курс EUR/RUB.');

  const seriesHybrid = isSeriesHybrid(input);
  if (input.seriesPowertrain && !['hybrid', 'plugin_hybrid'].includes(input.engineType)) {
    push('seriesPowertrain', 'Галочка «Силовая установка последовательного типа» применима только к гибриду/PHEV.');
  }
  if (input.engineType !== 'electric' && !finitePositive(input.engineCc)) push('engineCc', 'Объём двигателя должен быть больше нуля.');
  if (input.engineType !== 'electric' && !seriesHybrid && !finitePositive(input.icePowerKw)) push('icePowerKw', 'Мощность ДВС должна быть больше нуля и указываться в кВт.');
  if (['electric', 'hybrid', 'plugin_hybrid', 'series_hybrid'].includes(input.engineType) && !finitePositive(input.electric30MinKw)) {
    push('electric30MinKw', 'Для электрической/гибридной силовой установки укажите максимальную 30-минутную мощность ЭД в кВт.');
  }

  if (!input.productionMonth) push('productionMonth', 'Укажите дату выпуска.');
  if (!input.declarationDate) {
    push('declarationDate', 'Укажите дату расчёта/декларации.');
  } else if (input.declarationDate < '2026-01-01' || input.declarationDate > CALCULATION_VALID_THROUGH) {
    push('declarationDate', `Эта версия содержит тарифы 2026 года и рассчитана на даты с 01.01.2026 по ${CALCULATION_VALID_THROUGH}. Для 2027 года тарифную базу необходимо обновить по действующим НПА.`);
  }
  return errors;
}

function calculateTotal(input) {
  const validationErrors = validateCoreInput(input);
  if (validationErrors.length) return { ok: false, errors: validationErrors, warnings: [], blocked: true };

  const warnings = [];
  if (input.declarationDate > VERIFIED_AT) {
    warnings.push(`Курс Банка России загружен на выбранную дату. Тарифная база 2026 года последний раз юридически проверена ${VERIFIED_AT}; при изменении законодательства её необходимо обновить.`);
  }
  try {
    const age = determineAgeCategory(input.productionMonth, input.declarationDate);
    const converted = calculateCurrencyConversion(input.price, input.exchangeRate);
    const customsValue = calculateCustomsValue({ priceRub: converted.amountRub, additionsRub: input.additionsRub || 0 });

    const duty = calculateImportDuty({ ...input, customsValueRub: customsValue.amount, ageCategory: age });
    const customsFee = calculateCustomsFee(customsValue.amount);

    const personalUnified = duty.kind === 'unified_personal_payment';
    let excise;
    if (personalUnified) {
      excise = {
        amount: 0,
        formula: 'Не начисляется отдельно: включён в единую ставку таможенных пошлин, налогов.',
        tariff: 'в составе единой ставки',
        legalAct: SOURCES.decision107.title,
        source: SOURCES.decision107.url,
        verifiedAt: VERIFIED_AT,
      };
    } else {
      const excisePower = resolveExcisePowerKw(input);
      excise = calculateExcise(excisePower.value);
      excise.powerSource = excisePower.source;
    }

    const vat = personalUnified
      ? {
          amount: 0,
          taxBase: null,
          formula: 'Не начисляется отдельно: включён в единую ставку таможенных пошлин, налогов.',
          tariff: 'в составе единой ставки',
          legalAct: SOURCES.decision107.title,
          source: SOURCES.decision107.url,
          verifiedAt: VERIFIED_AT,
        }
      : calculateVAT({ customsValueRub: customsValue.amount, dutyRub: duty.amount, exciseRub: excise.amount });

    const recycling = calculateRecyclingFee({ ...input, ageCategory: age });
    warnings.push(...(recycling.warnings || []));
    warnings.push('Расчёт предварительный. Окончательный размер платежей и классификация определяются таможенным органом по документам и обстоятельствам ввоза.');

    const payments = duty.amount + customsFee.amount + recycling.amount + excise.amount + vat.amount;
    return {
      ok: true,
      blocked: false,
      age,
      priceRub: converted.amountRub,
      customsValue,
      duty,
      customsFee,
      excise,
      vat,
      recycling,
      totalPayments: payments,
      landedCost: converted.amountRub + payments,
      currency: input.currency,
      exchangeRate: Number(input.exchangeRate),
      eurRub: Number(input.eurRub),
      rateMode: input.rateMode || 'manual',
      rateRequestedDate: input.rateRequestedDate || input.declarationDate,
      rateEffectiveDate: input.rateEffectiveDate || null,
      rateSource: input.rateSource || '',
      inputSnapshot: {
        price: Number(input.price),
        engineType: input.engineType,
        engineCc: Number(input.engineCc || 0),
        icePowerKw: Number(input.icePowerKw || 0),
        electric30MinKw: Number(input.electric30MinKw || 0),
        seriesPowertrain: isSeriesHybrid(input),
        declarationDate: input.declarationDate,
      },
      warnings,
      route: personalUnified
        ? 'personal_unified'
        : (duty.kind === 'series_hybrid_aggregate_payment'
          ? 'series_hybrid_stp'
          : (duty.kind === 'ev_aggregate_payment' ? 'ev_stp' : 'standard_or_aggregate')),
      verifiedAt: VERIFIED_AT,
    };
  } catch (error) {
    if (error instanceof CalculationError) {
      return {
        ok: false,
        blocked: true,
        errors: [{ field: error.field, message: error.message, code: error.code }],
        warnings,
      };
    }
    throw error;
  }
}

/* app.js */


const calcRoot = document.getElementById('dvbr-customs-calculator');
const $ = (id) => calcRoot.querySelector(`#${CSS.escape(id)}`);
const CBR_PROXY_URL = (calcRoot.dataset.cbrProxy || '').trim();
const form = $('calculatorForm');
const rateCache = new Map();
let uiMode = 'simple';

function num(id, fallback = 0) {
  const el = $(id);
  if (!el) return fallback;
  const raw = el.value;
  return raw === '' || raw == null ? fallback : Number(raw);
}
function str(id) { return $(id)?.value?.trim() || ''; }
function checked(id) { return Boolean($(id)?.checked); }
function routeValue() { return calcRoot.querySelector('input[name="route"]:checked')?.value || 'physical_personal'; }
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function fmt(value, digits = 2) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(Number(value || 0));
}

function formatIsoDateRu(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso || '—');
}

function formatCbrDateRu(value) {
  const v = String(value || '');
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) return v;
  return formatIsoDateRu(v);
}

function routeParts() {
  switch (routeValue()) {
    case 'physical_resale': return { importer: 'physical', purpose: 'resale' };
    case 'legal_commercial': return { importer: 'legal', purpose: 'commercial' };
    case 'ip_commercial': return { importer: 'ip', purpose: 'commercial' };
    default: return { importer: 'physical', purpose: 'personal' };
  }
}

async function fetchCbrRates(date) {
  if (rateCache.has(date)) return rateCache.get(date);
  if (!CBR_PROXY_URL || CBR_PROXY_URL.includes('PASTE_WORKER_URL_HERE')) {
    throw new Error('Не настроен защищённый шлюз Банка России. Укажите URL CBR-proxy в data-cbr-proxy.');
  }
  const url = new URL(CBR_PROXY_URL, window.location.href);
  url.searchParams.set('date', date);
  const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json()).error || ''; } catch (_) {}
    throw new Error(`Банк России: HTTP ${response.status}${detail ? ' · ' + detail : ''}`);
  }
  const data = await response.json();
  if (!data || !data.rates) throw new Error('Сервис курса вернул некорректный ответ.');
  rateCache.set(date, data);
  return data;
}

async function resolveRates() {
  const mode = str('rateMode');
  const currency = str('currency');
  const date = str('declarationDate');
  if (mode === 'manual') {
    return {
      exchangeRate: currency === 'RUB' ? 1 : num('exchangeRate', NaN),
      eurRub: num('eurRub', NaN),
      requestedDate: date,
      effectiveDate: null,
      source: 'Ручной курс пользователя',
      label: `Ручной курс пользователя · дата расчёта ${formatIsoDateRu(date)}`,
    };
  }
  const data = await fetchCbrRates(date);
  const exchangeRate = currency === 'RUB' ? 1 : data.rates[currency];
  if (!exchangeRate) throw new Error(`В ответе Банка России нет курса ${currency}. Переключитесь на ручной режим.`);
  if (!data.rates.EUR) throw new Error('В ответе Банка России нет EUR/RUB. Переключитесь на ручной режим.');
  const requestedDate = data.requestedDate || date;
  const effectiveDate = data.effectiveDate || date;
  return {
    exchangeRate,
    eurRub: data.rates.EUR,
    requestedDate,
    effectiveDate,
    source: data.source || 'Банк России',
    label: `Дата расчёта: ${formatIsoDateRu(requestedDate)} · действующий официальный курс ЦБ: с ${formatCbrDateRu(effectiveDate)}
${currency}: ${fmt(exchangeRate, 6)} ₽ · EUR: ${fmt(data.rates.EUR, 6)} ₽`,
  };
}

async function refreshRatePreview() {
  if (str('rateMode') !== 'auto') return;
  const date = str('declarationDate');
  const box = $('rateInfo');
  box.classList.remove('rate-live', 'rate-error');
  box.textContent = 'Загружаем официальный курс Банка России…';
  try {
    const data = await fetchCbrRates(date);
    const parts = ['USD','EUR','CNY'].filter(c => data.rates[c]).map(c => `${c}: ${fmt(data.rates[c], 6)} ₽`);
    const requestedDate = data.requestedDate || date;
    const effectiveDate = data.effectiveDate || date;
    box.textContent =
      `Дата расчёта: ${formatIsoDateRu(requestedDate)} · действующий официальный курс ЦБ: с ${formatCbrDateRu(effectiveDate)}
` +
      `${parts.join(' · ')}
` +
      `Курс обновляется автоматически по данным Банка России. В выходные и праздничные дни используется последний действующий официальный курс.`;
    box.classList.add('rate-live');
  } catch (err) {
    box.textContent = `Не удалось получить курс автоматически: ${err.message} Можно временно переключиться на ручной режим.`;
    box.classList.add('rate-error');
  }
}

function setMode(mode) {
  uiMode = mode;
  calcRoot.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === mode));
  $('professionalFields').classList.toggle('hidden', mode !== 'pro');
  calcRoot.querySelectorAll('.pro-only-choice').forEach((el) => el.classList.toggle('hidden', mode !== 'pro'));
  $('modeHint').textContent = mode === 'pro'
    ? 'ТН ВЭД, ЕАЭС, документированная мощность и юридические условия.'
    : 'Только основные поля для типового расчёта.';
  refreshConditionalUi(false);
}

function needVerifiedTariff() {
  const { importer, purpose } = routeParts();
  return importer !== 'physical' || purpose !== 'personal';
}

function refreshConditionalUi(autoPromote = true) {
  const engineType = str('engineType');
  const hybridType = ['hybrid', 'plugin_hybrid'].includes(engineType);
  if (!hybridType && $('seriesPowertrain')) $('seriesPowertrain').checked = false;
  const seriesHybrid = engineType === 'series_hybrid' || (hybridType && checked('seriesPowertrain'));
  const electricLike = engineType === 'electric' || hybridType || engineType === 'series_hybrid';
  const pureEv = engineType === 'electric';
  const needsTariff = needVerifiedTariff();

  $('seriesHybridWrap')?.classList.toggle('hidden', !hybridType);
  $('engineCcWrap').classList.toggle('hidden', pureEv);
  $('icePowerWrap').classList.toggle('hidden', pureEv || seriesHybrid);
  $('electricPowerWrap').classList.toggle('hidden', !electricLike);
  $('manualRates').classList.toggle('hidden', str('rateMode') !== 'manual');
  $('tariffBlock').classList.toggle('hidden', !needsTariff);
  $('eaeuCorrectionBlock').classList.toggle('hidden', str('customsClearancePlace') !== 'other_eaeu');
  $('excisePowerWrap').classList.toggle('hidden', !needsTariff || ['petrol', 'diesel'].includes(engineType));

  if ($('electricPowerLabel')) {
    $('electricPowerLabel').textContent = seriesHybrid
      ? 'Мощность ЭД для последовательной установки, кВт'
      : 'Макс. 30-минутная мощность ЭД, кВт';
  }
  if ($('electricPowerHint')) {
    $('electricPowerHint').textContent = seriesHybrid
      ? 'В этой ветке именно эта мощность используется для утильсбора и для расчёта акциза; мощность ДВС с ней не суммируется.'
      : 'Для нескольких тяговых электродвигателей мощности суммируются.';
  }

  if (autoPromote && needsTariff && uiMode === 'simple') {
    setMode('pro');
    $('modeHint').textContent = 'Для выбранного маршрута нужен профессиональный режим: ТН ВЭД и подтверждённая ставка.';
  }
}

function tariffInput() {
  return {
    verified: checked('tariffVerified'),
    tnved: str('tnved'),
    rule: str('dutyRule'),
    percent: num('dutyPercent', NaN),
    eurPerCc: num('dutyEurPerCc', NaN),
    legalAct: str('dutyLegalAct'),
    source: str('dutySource'),
    verifiedAt: str('declarationDate'),
  };
}

async function collectInput() {
  const rates = await resolveRates();
  $('rateInfo').textContent = rates.label;
  const { importer, purpose } = routeParts();
  return {
    countryImport: 'RU',
    countryOrigin: str('countryOrigin') || 'Не указана',
    goodsStatus: str('goodsStatus') || 'non_union',
    importer,
    purpose,
    productionMonth: str('productionMonth'),
    declarationDate: str('declarationDate'),
    price: num('price', NaN),
    currency: str('currency'),
    exchangeRate: rates.exchangeRate,
    eurRub: rates.eurRub,
    rateMode: str('rateMode'),
    rateRequestedDate: rates.requestedDate || str('declarationDate'),
    rateEffectiveDate: rates.effectiveDate || null,
    rateSource: rates.source || (str('rateMode') === 'auto' ? 'Банк России' : 'Ручной курс пользователя'),
    additionsRub: num('additionsRub', 0),
    engineType: str('engineType'),
    seriesPowertrain: checked('seriesPowertrain'),
    engineCc: num('engineCc', 0),
    icePowerKw: num('icePowerKw', 0),
    electric30MinKw: num('electric30MinKw', 0),
    utilPowerKwOverride: num('utilPowerKwOverride', 0),
    excisePowerKw: num('excisePowerKw', 0),
    vin: str('vin'),
    personalConditionsConfirmed: checked('personalConditionsConfirmed'),
    priorPersonalVehicleWithin12m: checked('priorPersonalVehicleWithin12m'),
    earlyDisposalWithin12m: checked('earlyDisposalWithin12m'),
    customsClearancePlace: str('customsClearancePlace') || 'russia',
    tariff: tariffInput(),
    eaeuCorrection: {
      actualDuty: num('actualDuty', NaN),
      referenceDuty: num('referenceDuty', NaN),
      actualVat: num('actualVat', NaN),
      referenceVat: num('referenceVat', NaN),
      actualExcise: num('actualExcise', NaN),
      referenceExcise: num('referenceExcise', NaN),
    },
  };
}

function detail(title, amount, item, extras = '') {
  const sourceLink = item?.source
    ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noreferrer">открыть источник</a>`
    : '—';
  return `<details class="detail">
    <summary><span>${escapeHtml(title)}</span><strong>${escapeHtml(money(amount))}</strong></summary>
    <div class="detail-body">
      ${extras}
      <div class="detail-row"><b>Формула</b><span>${escapeHtml(item?.formula || '—')}</span></div>
      <div class="detail-row"><b>Ставка / коэффициент</b><span>${escapeHtml(item?.tariff ?? item?.coefficient ?? '—')}</span></div>
      <div class="detail-row"><b>Основание</b><span>${escapeHtml(item?.legalAct || '—')}</span></div>
      <div class="detail-row"><b>Источник</b><span>${sourceLink}</span></div>
      <div class="detail-row"><b>Проверено</b><span>${escapeHtml(item?.verifiedAt || VERIFIED_AT)}</span></div>
    </div>
  </details>`;
}

function clearInvalid() {
  calcRoot.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}

function markErrorFields(errors = []) {
  clearInvalid();
  for (const err of errors) {
    const el = err.field ? $(err.field) : null;
    if (el) {
      el.classList.add('invalid');
      el.closest('.field')?.classList.add('invalid');
    }
  }
}

function renderErrors(errors, extra = '') {
  $('emptyState').classList.add('hidden');
  $('result').classList.add('hidden');
  markErrorFields(errors);
  const list = (errors || []).map((e) => `<li>${escapeHtml(e.message || e)}</li>`).join('');
  $('errorBox').innerHTML = `<div class="error-title">Точный расчёт остановлен</div><ul>${list}</ul>${extra ? `<p>${escapeHtml(extra)}</p>` : ''}`;
  $('errorBox').classList.remove('hidden');
}

function currencyMoney(rub, r) {
  if (!r?.exchangeRate || !r?.currency) return '—';
  return `${fmt(Number(rub) / Number(r.exchangeRate), 2)} ${escapeHtml(r.currency)}`;
}

function engineLabel(type, seriesPowertrain = false) {
  const base = ({petrol:'Бензиновый', diesel:'Дизельный', hybrid:'Бензиновый электрогибрид', plugin_hybrid:'Plug-in hybrid (PHEV)', series_hybrid:'Бензиновый электрогибрид', electric:'Электрический'})[type] || type;
  return (seriesPowertrain || type === 'series_hybrid')
    ? `${base} · силовая установка последовательного типа`
    : base;
}

function powerDisplay(r) {
  const x = r.inputSnapshot || {};
  if (x.engineType === 'electric') return `${fmt(x.electric30MinKw, 2)} кВт`;
  if (x.seriesPowertrain || x.engineType === 'series_hybrid') return `${fmt(x.electric30MinKw, 2)} кВт (ЭД, последовательная установка)`;
  if (['hybrid','plugin_hybrid'].includes(x.engineType)) return `${fmt(x.icePowerKw, 2)} кВт + ${fmt(x.electric30MinKw, 2)} кВт`;
  return `${fmt(x.icePowerKw, 2)} кВт`;
}

function renderResult(r) {
  clearInvalid();
  $('emptyState').classList.add('hidden');
  $('errorBox').classList.add('hidden');
  const routeLabel = r.route === 'personal_unified'
    ? 'Физлицо · личное пользование · единая ставка'
    : (r.route === 'ev_stp'
      ? 'Физлицо · электромобиль · СТП'
      : (r.route === 'series_hybrid_stp'
        ? 'Физлицо · последовательный гибрид · СТП'
        : 'СТП / стандартный импортный маршрут'));

  const recyclingExtras = `
    <div class="detail-row"><b>Базовая ставка</b><span>${escapeHtml(money(r.recycling.baseRate))}</span></div>
    <div class="detail-row"><b>Коэффициент</b><span>${fmt(r.recycling.coefficient, 4)}</span></div>
    <div class="detail-row"><b>Мощность для утильсбора</b><span>${fmt(r.recycling.utilPowerKw, 4)} кВт</span></div>
    <div class="detail-row"><b>Как определена мощность</b><span>${escapeHtml(r.recycling.powerFormula)}</span></div>
    ${r.recycling.eaeuCorrection?.total ? `<div class="detail-row"><b>Корректировка ЕАЭС</b><span>Ктп ${money(r.recycling.eaeuCorrection.ktp)}, Кндс ${money(r.recycling.eaeuCorrection.kvat)}, Ка ${money(r.recycling.eaeuCorrection.ka)}</span></div>` : ''}
    ${r.recycling.earlyDisposalTopUp ? `<div class="detail-row"><b>Доплата при отчуждении &lt;12 мес.</b><span>${money(r.recycling.earlyDisposalTopUp)}</span></div>` : ''}
  `;

  const dutyExtras = `
    ${r.duty.customsValueEur ? `<div class="detail-row"><b>Таможенная стоимость</b><span>${fmt(r.duty.customsValueEur)} EUR</span></div>` : ''}
    ${r.duty.tnved ? `<div class="detail-row"><b>ТН ВЭД</b><span>${escapeHtml(r.duty.tnved)}</span></div>` : ''}
    ${r.duty.note ? `<div class="detail-row"><b>Примечание</b><span>${escapeHtml(r.duty.note)}</span></div>` : ''}
  `;

  const exciseExtras = r.excise.powerKw != null
    ? `<div class="detail-row"><b>Мощность</b><span>${fmt(r.excise.powerKw, 4)} кВт → ${fmt(r.excise.powerHp, 2)} л.с.</span></div>
       <div class="detail-row"><b>Перевод для акциза</b><span>1 л.с. = 0,75 кВт; л.с. = кВт ÷ 0,75. Л.с. используются только внутри расчёта акциза.</span></div>`
    : '';

  $('result').innerHTML = `
    <div class="route-line"><span class="route-tag">${escapeHtml(routeLabel)}</span><span>Возраст: ${escapeHtml(r.age.label)}</span></div>

    <div class="total-card">
      <span>Итого таможенных платежей</span>
      <strong>${escapeHtml(money(r.totalPayments))}</strong>
      <small>${currencyMoney(r.totalPayments, r)} · база проверена ${VERIFIED_AT}</small>
    </div>

    <h3 class="breakdown-title">Схема расчёта</h3>
    <div class="scheme-table">
      <div><span>Возраст</span><b>${escapeHtml(r.age.label)}</b></div>
      <div><span>Стоимость автомобиля</span><b>${fmt(r.inputSnapshot.price, 2)} ${escapeHtml(r.currency)}</b></div>
      <div><span>Таможенная стоимость в рублях</span><b>${money(r.customsValue.amount)}</b></div>
      <div><span>Объём двигателя</span><b>${r.inputSnapshot.engineType === 'electric' ? '0 см³' : `${fmt(r.inputSnapshot.engineCc, 0)} см³`}</b></div>
      <div><span>Мощность</span><b>${powerDisplay(r)}</b></div>
      <div><span>Тип двигателя</span><b>${escapeHtml(engineLabel(r.inputSnapshot.engineType, r.inputSnapshot.seriesPowertrain))}</b></div>
      <div><span>Дата расчёта / декларации</span><b>${escapeHtml(formatIsoDateRu(r.rateRequestedDate || r.inputSnapshot.declarationDate))}</b></div>
      <div><span>${r.rateMode === 'auto' ? 'Действующий официальный курс ЦБ' : 'Курс валют'}</span><b>${r.rateMode === 'auto' ? `с ${escapeHtml(formatCbrDateRu(r.rateEffectiveDate || r.rateRequestedDate))}` : 'введён вручную'}</b></div>
      <div><span>Курс ${escapeHtml(r.currency)}</span><b>${fmt(r.exchangeRate, 6)} ₽</b></div>
      <div><span>Курс EUR</span><b>${fmt(r.eurRub, 6)} ₽</b></div>
    </div>

    <h3 class="breakdown-title">Таможенные платежи</h3>
    <div class="payments-table-wrap">
      <table class="payments-table">
        <thead><tr><th>Вид сбора</th><th>Основа начисления</th><th>Ставка</th><th>Сумма, ₽</th><th>Сумма, ${escapeHtml(r.currency)}</th></tr></thead>
        <tbody>
          <tr><td>Таможенный сбор</td><td>${money(r.customsValue.amount)}</td><td>${escapeHtml(r.customsFee.tariff)}</td><td>${money(r.customsFee.amount)}</td><td>${currencyMoney(r.customsFee.amount, r)}</td></tr>
          <tr><td>Пошлина</td><td>${r.duty.customsValueEur ? `${fmt(r.inputSnapshot.engineCc,0)} см³` : money(r.customsValue.amount)}</td><td>${escapeHtml(r.duty.tariff)}</td><td>${money(r.duty.amount)}</td><td>${currencyMoney(r.duty.amount, r)}</td></tr>
          ${r.route === 'personal_unified' ? '' : `<tr><td>Акциз</td><td>${r.excise.powerHp != null ? `${fmt(r.excise.powerHp,2)} л.с.` : '—'}</td><td>${escapeHtml(r.excise.tariff)}</td><td>${money(r.excise.amount)}</td><td>${currencyMoney(r.excise.amount, r)}</td></tr>
          <tr><td>НДС</td><td>${r.vat.taxBase != null ? money(r.vat.taxBase) : '—'}</td><td>${escapeHtml(r.vat.tariff)}</td><td>${money(r.vat.amount)}</td><td>${currencyMoney(r.vat.amount, r)}</td></tr>`}
          <tr><td><b>Утилизационный сбор</b></td><td>${money(r.recycling.baseRate)}</td><td>${fmt(r.recycling.coefficient,4)}</td><td>${money(r.recycling.amount)}</td><td>${currencyMoney(r.recycling.amount, r)}</td></tr>
        </tbody>
        <tfoot><tr><th colspan="3">Итого</th><th>${money(r.totalPayments)}</th><th>${currencyMoney(r.totalPayments, r)}</th></tr></tfoot>
      </table>
    </div>

    <div class="kpis">
      <div><span>Цена в ₽</span><b>${money(r.priceRub)}</b></div>
      <div><span>Утиль-мощность</span><b>${fmt(r.recycling.utilPowerKw, 2)} кВт</b></div>
      <div><span>Авто + платежи</span><b>${money(r.landedCost)}</b></div>
    </div>

    <h3 class="breakdown-title">Как рассчитано</h3>
    ${detail('1. Таможенная стоимость', r.customsValue.amount, {
      ...r.customsValue,
      tariff: 'индивидуально по составу стоимости',
      legalAct: 'Таможенный кодекс ЕАЭС / правила определения таможенной стоимости',
      verifiedAt: VERIFIED_AT,
    }, `<div class="detail-row"><b>Стоимость автомобиля после конвертации</b><span>${money(r.priceRub)}</span></div>`)}
    ${detail('2. Пошлина / единый платёж', r.duty.amount, r.duty, dutyExtras)}
    ${detail('3. Таможенный сбор', r.customsFee.amount, r.customsFee, `<div class="detail-row"><b>Диапазон</b><span>${escapeHtml(r.customsFee.range)}</span></div>`)}
    ${detail('4. Акциз', r.excise.amount, r.excise, exciseExtras)}
    ${detail('5. НДС', r.vat.amount, r.vat, r.vat.taxBase != null ? `<div class="detail-row"><b>Налоговая база</b><span>${money(r.vat.taxBase)}</span></div>` : '')}
    ${detail('6. Утилизационный сбор', r.recycling.amount, r.recycling, recyclingExtras)}

    ${(r.warnings || []).map((w) => `<div class="warning">${escapeHtml(w)}</div>`).join('')}
  `;
  $('result').classList.remove('hidden');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const input = await collectInput();
    const result = calculateTotal(input);
    if (!result.ok) return renderErrors(result.errors, 'Калькулятор не подставляет приблизительную ставку вместо отсутствующих данных.');
    renderResult(result);
  } catch (error) {
    renderErrors([{ message: error.message || String(error) }], 'Если автоматический курс недоступен, переключитесь на ручной режим и используйте официальный курс на дату декларации.');
  }
});

$('resetBtn').addEventListener('click', () => {
  form.reset();
  $('price').value = '20000';
  $('productionMonth').value = '2024-06';
  $('declarationDate').value = todayIso;
  $('engineCc').value = '1998';
  $('icePowerKw').value = '110';
  $('electric30MinKw').value = '0';
  if ($('seriesPowertrain')) $('seriesPowertrain').checked = false;
  $('additionsRub').value = '0';
  $('personalConditionsConfirmed').checked = true;
  setMode('simple');
  refreshConditionalUi(false);
  clearInvalid();
  $('result').classList.add('hidden');
  $('errorBox').classList.add('hidden');
  $('emptyState').classList.remove('hidden');
  $('rateMode').value = 'auto';
  $('currency').value = 'CNY';
  $('rateInfo').textContent = 'Загружаем официальный курс Банка России…';
  refreshRatePreview();
});

function setRoute(value) {
  const el = calcRoot.querySelector(`input[name="route"][value="${value}"]`);
  if (el) el.checked = true;
}

function applyPreset(kind) {
  setRoute('physical_personal');
  $('rateMode').value = 'manual';
  $('currency').value = 'CNY';
  $('personalConditionsConfirmed').checked = true;
  $('priorPersonalVehicleWithin12m').checked = false;
  $('earlyDisposalWithin12m').checked = false;
  if ($('seriesPowertrain')) $('seriesPowertrain').checked = false;

  if (kind === 'ev') {
    $('price').value = '84700';
    $('exchangeRate').value = '11.9677';
    $('eurRub').value = '93.5824';
    $('productionMonth').value = '2025-06';
    $('declarationDate').value = '2026-08-05';
    $('engineType').value = 'electric';
    $('engineCc').value = '0';
    $('icePowerKw').value = '0';
    $('electric30MinKw').value = '45';
  } else if (kind === 'series') {
    $('price').value = '100000';
    $('exchangeRate').value = '12.8537';
    $('eurRub').value = '100.1711';
    $('productionMonth').value = '2025-06';
    $('declarationDate').value = todayIso;
    $('engineType').value = 'hybrid';
    $('engineCc').value = '1498';
    $('icePowerKw').value = '0';
    $('electric30MinKw').value = '45';
    $('seriesPowertrain').checked = true;
  } else {
    $('price').value = '150000';
    $('exchangeRate').value = '12.1655';
    $('eurRub').value = '94.8366';
    $('productionMonth').value = '2022-08';
    $('declarationDate').value = '2026-08-10';
    $('engineType').value = 'hybrid';
    $('engineCc').value = '1987';
    $('icePowerKw').value = '48';
    $('electric30MinKw').value = '107';
  }
  setMode('simple');
  refreshConditionalUi(false);
  $('rateInfo').textContent = 'Контрольный ручной курс из предоставленного расчёта.';
  form.requestSubmit();
}

$('presetEv')?.addEventListener('click', () => applyPreset('ev'));
$('presetHybrid')?.addEventListener('click', () => applyPreset('hybrid'));
$('presetSeriesHybrid')?.addEventListener('click', () => applyPreset('series'));

calcRoot.querySelectorAll('.mode-btn').forEach((btn) => btn.addEventListener('click', () => {
  if (btn.dataset.mode === 'simple' && needVerifiedTariff()) {
    setMode('pro');
    $('modeHint').textContent = 'Для выбранного автомобиля/маршрута обязательны профессиональные поля: ТН ВЭД и подтверждённая ставка.';
    return;
  }
  setMode(btn.dataset.mode);
}));
calcRoot.querySelectorAll('input[name="route"]').forEach((el) => el.addEventListener('change', () => refreshConditionalUi(true)));
['engineType', 'customsClearancePlace', 'seriesPowertrain'].forEach((id) => $(id)?.addEventListener('change', () => refreshConditionalUi(true)));
$('rateMode')?.addEventListener('change', () => { refreshConditionalUi(true); refreshRatePreview(); });
$('declarationDate').addEventListener('change', () => { rateCache.clear(); refreshRatePreview(); });
$('currency').addEventListener('change', () => { refreshRatePreview(); });

// Дата расчёта по умолчанию — текущая локальная дата пользователя.
const nowLocal = new Date();
const todayIso = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth()+1).padStart(2,'0')}-${String(nowLocal.getDate()).padStart(2,'0')}`;
$('declarationDate').max = todayIso;
$('declarationDate').value = todayIso;
$('rateMode').value = 'auto';
setMode('simple');
refreshConditionalUi(false);
refreshRatePreview();
