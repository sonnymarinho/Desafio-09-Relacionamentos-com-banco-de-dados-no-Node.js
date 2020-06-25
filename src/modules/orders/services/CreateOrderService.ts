import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    // Verifying if customer exists
    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    // Verifying if all products requested exists
    const productsFromDB = await this.productsRepository.findAllById(products);
    if (productsFromDB.length !== products.length) {
      throw new AppError(
        'You are not be able to create an order with an invalid product.',
      );
    }

    // Verifying if the quantity requested is less than the quantity available
    products.forEach(requestedProduct => {
      const dbProduct = productsFromDB.find(
        productDB => productDB.id === requestedProduct.id,
      );

      const dbQuantity = dbProduct?.quantity;
      const reqQuantity = requestedProduct.quantity;

      if (dbQuantity && dbQuantity < reqQuantity) {
        throw new AppError(
          'You are not be able to create an order with an invalid product.',
        );
      }
    });

    const formatedProductList = productsFromDB.map(productDB => {
      const { id: product_id, price } = productDB;
      let quantity = 0;

      products.forEach(product => {
        if (product.id === productDB.id) {
          quantity = product.quantity;
        }
      });

      return {
        product_id,
        price,
        quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: formatedProductList,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
