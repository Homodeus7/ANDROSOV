import {
  CURRENCIES,
  NETWORKS,
  type PayoutField,
  type PayoutMethod,
  type PayoutValues,
} from "./types";

const holder: PayoutField = {
  name: "holder",
  type: "string",
  checks: [
    { kind: "min", value: 2 },
    { kind: "max", value: 64 },
  ],
};

const WALLET: Record<string, string> = {
  TRC20: "^T[1-9A-HJ-NP-Za-km-z]{33}$",
  ERC20: "^0x[0-9a-fA-F]{40}$",
};

const LIMITS: Record<PayoutMethod, { min: number; max: number }> = {
  card: { min: 10, max: 5000 },
  sepa: { min: 10, max: 50000 },
  swift: { min: 100, max: 250000 },
  crypto: { min: 20, max: 100000 },
};

/** SEPA живёт только в евро, поэтому выбор валюты — тоже часть схемы, а не отдельная проверка. */
export const currenciesFor = (method: PayoutMethod): readonly string[] =>
  method === "sepa" ? ["EUR"] : CURRENCIES;

/**
 * Набор полей — функция от текущих значений, а не только от способа вывода:
 * адрес кошелька проверяется по сети, которую пользователь выбрал в поле выше.
 * Ровно поэтому схему приходится собирать заново на каждое изменение.
 */
export function payoutFields(method: PayoutMethod, values: PayoutValues): PayoutField[] {
  const limits = LIMITS[method];

  const common: PayoutField[] = [
    {
      name: "amount",
      type: "number",
      checks: [
        { kind: "min", value: limits.min },
        { kind: "max", value: limits.max },
      ],
    },
    { name: "currency", type: "enum", options: currenciesFor(method), checks: [] },
  ];

  if (method === "card")
    return [
      ...common,
      {
        name: "cardNumber",
        type: "string",
        checks: [{ kind: "pattern", source: "^\\d{16}$" }],
      },
      holder,
    ];

  if (method === "sepa")
    return [
      ...common,
      {
        name: "iban",
        type: "string",
        checks: [{ kind: "pattern", source: "^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$" }],
      },
      holder,
    ];

  if (method === "swift")
    return [
      ...common,
      { name: "account", type: "string", checks: [{ kind: "pattern", source: "^\\d{8,20}$" }] },
      {
        name: "bic",
        type: "string",
        checks: [{ kind: "pattern", source: "^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$" }],
      },
      holder,
    ];

  const network = NETWORKS.includes(values.network as (typeof NETWORKS)[number])
    ? values.network!
    : NETWORKS[0];

  return [
    ...common,
    { name: "network", type: "enum", options: NETWORKS, checks: [] },
    { name: "wallet", type: "string", checks: [{ kind: "pattern", source: WALLET[network]! }] },
  ];
}

/**
 * Значения, которым в новой схеме места нет, выбрасываются. Иначе на бэкенд
 * уехал бы IBAN вместе с выплатой на карту — поле со старого шага формы,
 * которого пользователь уже не видит.
 */
export function pruneValues(
  fields: readonly PayoutField[],
  values: PayoutValues,
): PayoutValues {
  const kept: PayoutValues = {};

  for (const field of fields) {
    const value = values[field.name];
    if (value === undefined) continue;
    if (field.options && !field.options.includes(value)) continue;
    kept[field.name] = value;
  }

  return kept;
}
