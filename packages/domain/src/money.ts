export type Money = Readonly<{
  amount: number;
  currency: "NGN";
}>;

export const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

export const formatMoney = ({ amount, currency }: Money): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
