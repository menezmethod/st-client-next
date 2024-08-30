export interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balances: {
    current: number;
    available?: number;
    limit?: number;
  };
}