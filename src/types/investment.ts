export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  holdings: {
    quantity: number;
    cost_basis: number;
    institution_price: number;
    institution_value: number;
  };
}