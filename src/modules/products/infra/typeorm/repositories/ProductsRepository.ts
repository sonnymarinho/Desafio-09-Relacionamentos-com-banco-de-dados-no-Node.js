import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(product => product.id);

    const allProducts = await this.ormRepository.find({
      id: In(productsIds),
    });

    return allProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsList = await this.findAllById(
      products.map(product => {
        return { id: product.id };
      }),
    );

    const updatedProductsList = productsList.reduce(
      (accumulator: Product[], productsList) => {
        switch (transactions.type) {
          case 'outcome':
            accumulator.outcome += transactions.value;
            break;
          case 'income':
            accumulator.income += transactions.value;
            break;
          default:
            break;
        }

        return accumulator;
      },
    );
  }
}

export default ProductsRepository;
