export interface ClienteAddress {
  publicId: string;
  department: string;
  province: string;
  district: string;
  addressLine: string;
  reference: string | null;
  primary: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteAddressPayload {
  department: string;
  province: string;
  district: string;
  addressLine: string;
  reference: string | null;
  primary: boolean;
}
