import { getRepository, Repository, In } from 'typeorm';

import AppError from '@shared/errors/AppError';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

interface IQuantityByID {
  [id: string]: number;
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
    const productsIDs = products.map(product => product.id);

    const allProducts = await this.ormRepository.find({
      id: In(productsIDs),
    });

    return allProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsFromDB = await this.findAllById(products);

    const toBeAjustedProducts = products.map(product => {
      const { id, quantity } = product;

      const toBeAjustedProduct = productsFromDB.find(
        productFromDB => productFromDB.id === id,
      );

      if (!toBeAjustedProduct) {
        throw new AppError(
          "Isn't possible to be ajust the product. Product does not exists.",
        );
      }

      toBeAjustedProduct.quantity -= quantity;

      return toBeAjustedProduct;
    });

    await this.ormRepository.save(toBeAjustedProducts);

    return toBeAjustedProducts;
  }
}

export default ProductsRepository;
