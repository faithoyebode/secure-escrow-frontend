
import { Product } from "@/types";

type SellerInfoProps = {
  sellerName: string;
};

export default function SellerInfo({ sellerName }: SellerInfoProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="font-medium text-escrow-darkBlue">
          {sellerName.substring(0, 2)}
        </span>
      </div>
      <div>
        <p className="font-medium">{sellerName}</p>
        <p className="text-sm text-gray-500">Verified Seller</p>
      </div>
    </div>
  );
}
