import { Entity, model, property } from "@loopback/repository";

@model()
export class Payment extends Entity {
  @property({ type: "string", id: true, generated: true })
  id?: string;

  @property({ type: "string", required: true })
  orderId: string;

  @property({ type: "number", required: true })
  amount: number;

  @property({ type: "string", default: "paid" })
  status?: string;

  constructor(data?: Partial<Payment>) {
    super(data);
  }
}

export interface PaymentRelations {}
export type PaymentWithRelations = Payment & PaymentRelations;
