import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './products.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ProductsService {
  products: Product[] = [];
  constructor(
    @InjectModel('Product') private readonly ProductModel: Model<Product>,
  ) {}

  async insertProduct(title: string, description: string, price: number) {
    const newProduct = new this.ProductModel({ title, description, price });
    const result = await newProduct.save();
    return result.id as string;
  }

  async getProducts() {
    const products = await this.ProductModel.find().exec();
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    })) as Product[];
  }

  async getSingleProducts(id: string) {
    const product = await this.findProduct(id);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    productId: string,
    title: string,
    description: string,
    price: number,
  ) {
    const updatedProduct = await this.findProduct(productId);
    if (title) {
      updatedProduct.title = title;
    }
    if (description) {
      updatedProduct.description = description;
    }
    if (price) {
      updatedProduct.price = price;
    }
    updatedProduct.save();
  }

  async deleteProduct(productId: string) {
    const result = await this.ProductModel.deleteOne({ _id: productId }).exec();
    console.log(result);
    if (result.deletedCount === 0) {
      throw new NotFoundException('could not find product');
    }
  }

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.ProductModel.findById(id);
    } catch (error) {
      throw new NotFoundException('something wrong happened');
    }
    if (!product) {
      throw new NotFoundException('could not find product');
    }
    return product;
  }
}
