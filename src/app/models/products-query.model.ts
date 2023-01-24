export interface ProductsQueryModel {
  readonly name: string;
  readonly price: number;
  readonly ratingValue: number;
  readonly ratingCount: number;
  readonly starsRating: number[];
  readonly imageUrl: string;
  readonly featureValue: number;
  readonly storeIds: string[];
  readonly id: string;
}
