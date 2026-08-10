import { describe, expect, it } from "vitest";
import { currenciesFor, payoutFields, pruneValues } from "./fields";
import { printSchema, validatePayout } from "./schema";
import { PAYOUT_METHODS } from "./types";

const names = (method: Parameters<typeof payoutFields>[0], values = {}) =>
  payoutFields(method, values).map((field) => field.name);

describe("payout schema", () => {
  it("changes the field set with the method", () => {
    expect(names("card")).toEqual(["amount", "currency", "cardNumber", "holder"]);
    expect(names("sepa")).toEqual(["amount", "currency", "iban", "holder"]);
    expect(names("swift")).toEqual(["amount", "currency", "account", "bic", "holder"]);
    expect(names("crypto")).toEqual(["amount", "currency", "network", "wallet"]);
  });

  it("leaves SEPA no currency to pick", () => {
    expect(currenciesFor("sepa")).toEqual(["EUR"]);
    expect(currenciesFor("swift").length).toBeGreaterThan(1);
  });

  // Схема зависит не только от способа вывода, но и от значения соседнего
  // поля — ради этого её и приходится собирать заново на каждую правку
  it("checks the wallet against the network the user picked", () => {
    const trc = payoutFields("crypto", { network: "TRC20" }).find((f) => f.name === "wallet")!;
    const erc = payoutFields("crypto", { network: "ERC20" }).find((f) => f.name === "wallet")!;

    expect(trc.checks).not.toEqual(erc.checks);
    expect(printSchema([erc])).toContain("0x");
  });

  it("falls back to the first network when the value is nonsense", () => {
    const wallet = payoutFields("crypto", { network: "DOGE" }).find(
      (f) => f.name === "wallet",
    )!;
    expect(wallet.checks).toEqual(
      payoutFields("crypto", { network: "TRC20" }).find((f) => f.name === "wallet")!.checks,
    );
  });

  // Панель обязана печатать ровно то, чем схема проверяет: иначе демо
  // показывает одно, а форма делает другое
  it("prints every rule it validates by", () => {
    for (const method of PAYOUT_METHODS) {
      const fields = payoutFields(method, { network: "ERC20" });
      const source = printSchema(fields);

      for (const field of fields) {
        expect(source, method).toContain(`${field.name}: z.`);
        for (const check of field.checks) {
          const printed =
            check.kind === "pattern" ? `/${check.source}/` : `.${check.kind}(${check.value})`;
          expect(source, `${method}.${field.name}`).toContain(printed);
        }
        for (const option of field.options ?? []) {
          expect(source, `${method}.${field.name}`).toContain(`"${option}"`);
        }
      }
    }
  });

  it("accepts a payout that fits the method", () => {
    const fields = payoutFields("sepa", {});
    const result = validatePayout(fields, {
      amount: "250",
      currency: "EUR",
      iban: "DE89370400440532013000",
      holder: "A Merchant",
    });

    expect(result).toEqual({ ok: true, errors: {} });
  });

  it("names every field that failed, not just the first", () => {
    const fields = payoutFields("card", {});
    const result = validatePayout(fields, {
      amount: "9",
      currency: "EUR",
      cardNumber: "4111",
      holder: "",
    });

    expect(result.ok).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(["amount", "cardNumber", "holder"]);
  });

  it("moves the amount limits with the method", () => {
    const values = { amount: "50", currency: "USD" };

    expect(
      validatePayout(payoutFields("card", {}), {
        ...values,
        cardNumber: "4111111111111111",
        holder: "Ok",
      }).ok,
    ).toBe(true);
    expect(
      validatePayout(payoutFields("swift", {}), {
        ...values,
        account: "12345678",
        bic: "DEUTDEFF",
        holder: "Ok",
      }).errors.amount,
    ).toBeDefined();
  });

  it("drops values that the new schema has no place for", () => {
    const values = { amount: "100", currency: "EUR", iban: "DE89370400440532013000" };
    const kept = pruneValues(payoutFields("card", {}), values);

    expect(kept).toEqual({ amount: "100", currency: "EUR" });
  });

  it("drops a currency the new method does not allow", () => {
    const kept = pruneValues(payoutFields("sepa", {}), { currency: "USD", amount: "100" });
    expect(kept.currency).toBeUndefined();
  });
});
