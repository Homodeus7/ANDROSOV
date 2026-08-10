export const TX_STATUSES = ["pending", "authorised", "captured", "refunded", "failed"] as const;

export type TxStatus = (typeof TX_STATUSES)[number];

export type Transaction = {
  id: string;
  merchant: string;
  method: string;
  amount: number;
  currency: string;
  status: TxStatus;
};

export type TxUpdate = { id: string; status: TxStatus };
