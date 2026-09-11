import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from "@loopback/repository";
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from "@loopback/rest";
import { Payment } from "../models";
import { PaymentRepository } from "../repositories";
import { publierPaiement } from "../rabbit";

const ORDERS_API = process.env.ORDERS_API || "http://localhost:3001";
export class PaymentController {
  constructor(
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
  ) {}

  @post("/payments")
  @response(200, {
    description: "Payment model instance",
    content: { "application/json": { schema: getModelSchemaRef(Payment) } },
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Payment, {
            title: "NewPayment",
            exclude: ["id"],
          }),
        },
      },
    })
    payment: Omit<Payment, "id">,
  ): Promise<Payment> {
    const response = await fetch(`${ORDERS_API}/orders/${payment.orderId}`);
    if (!response.ok) {
      throw new HttpErrors.UnprocessableEntity(
        `Order with id ${payment.orderId} does not exist`,
      );
    }
    const cree = await this.paymentRepository.create(payment);
    publierPaiement({orderId: cree.orderId, amount: cree.amount});
    return cree;
  }

  @get("/payments/count")
  @response(200, {
    description: "Payment model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(Payment) where?: Where<Payment>): Promise<Count> {
    return this.paymentRepository.count(where);
  }

  @get("/payments")
  @response(200, {
    description: "Array of Payment model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Payment, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Payment) filter?: Filter<Payment>,
  ): Promise<Payment[]> {
    return this.paymentRepository.find(filter);
  }

  @patch("/payments")
  @response(200, {
    description: "Payment PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Payment, { partial: true }),
        },
      },
    })
    payment: Payment,
    @param.where(Payment) where?: Where<Payment>,
  ): Promise<Count> {
    return this.paymentRepository.updateAll(payment, where);
  }

  @get("/payments/{id}")
  @response(200, {
    description: "Payment model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Payment, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(Payment, { exclude: "where" })
    filter?: FilterExcludingWhere<Payment>,
  ): Promise<Payment> {
    return this.paymentRepository.findById(id, filter);
  }

  @patch("/payments/{id}")
  @response(204, {
    description: "Payment PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Payment, { partial: true }),
        },
      },
    })
    payment: Payment,
  ): Promise<void> {
    await this.paymentRepository.updateById(id, payment);
  }

  @put("/payments/{id}")
  @response(204, {
    description: "Payment PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() payment: Payment,
  ): Promise<void> {
    await this.paymentRepository.replaceById(id, payment);
  }

  @del("/payments/{id}")
  @response(204, {
    description: "Payment DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.paymentRepository.deleteById(id);
  }
}
