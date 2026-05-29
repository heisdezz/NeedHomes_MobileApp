export type AccountType = "INDIVIDUAL" | "INVESTOR" | "PARTNER" | "CORPORATE" | "ADMIN";

export interface USER {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
  profilePicture: string | null;
  phone: string | number;
  [key: string]: any;
}

export interface INVESTOR {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  accountType: "INVESTOR";
  account_status: "ACTIVE";
  account_verification_status: "PENDING";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: {
    userId: string;
    roleId: string;
    assignedAt: string;
    role: {
      name: string;
    };
  }[];
}
[];
type roles = "USER" | "ADMIN";
export interface PARTNER {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountType: "PARTNER";
  account_status: "ACTIVE";
  account_verification_status: "PENDING";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: roles[];
}

export interface VERIFICATION_REQUEST {
  id: string;
  user_id: string;
  idType: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  frontPage: string | null;
  companyName: string | null;
  rcNumber: string | null;
  cacDocument: string | null;
  backPage: string | null;
  authorizedId: string | null;
  authorizedName: string | null;
  utilityBill: string | null;
  address: string;
  verificationType: "INDIVIDUAL" | "CORPORATE";
  submitedAt: string;
  RejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: {
    id: string;
    profilePicture: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isEmailVerified: boolean;
    accountType: string;
    companyName: string | null;
    account_status: string;
    account_verification_status: string;
    referral_source: string;
    partnerType: string | null;
    referralCode: string | null;
    totalReferrals: number;
    totalCommission: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    bank_account: {
      id: string;
      user_id: string;
      account_number: string;
      bank_code: string;
      bank_name: string;
      account_name: string;
      country: string;
      currency: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    } | null;
  };
}
export interface ADMIN_INVESTOR_DATA {
  id: string;
  profilePicture: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  accountType: string;
  companyName: string | null;
  account_status: string;
  account_verification_status: string;
  referral_source: string;
  partnerType: string | null;
  referralCode: string | null;
  totalReferrals: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: {
    userId: string;
    roleId: string;
    assignedAt: string;
    role: {
      name: string;
      permissions: {
        roleId: string;
        permissionId: string;
        createdAt: string;
        permission: {
          key: string;
          description: string;
        };
      }[];
    };
  }[];
  verification_document: {
    id: string;
    user_id: string;
    idType: string;
    frontPage: string | null;
    companyName: string | null;
    companyAddress: string | null;
    rcNumber: string | null;
    cacDocument: string | null;
    backPage: string | null;
    authorizedId: string | null;
    authorizedName: string | null;
    utilityBill: string | null;
    address: string | null;
    verificationType: string;
    status: string;
    submitedAt: string;
    RejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
  bank_account: {
    id: string;
    user_id: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
    account_name: string;
    country: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
}

export interface ADMIN_PARTNER_DATA {
  id: string;
  profilePicture: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  accountType: "PARTNER";
  companyName: string | null;
  account_status: string;
  account_verification_status: string;
  referral_source: string | null;
  partnerType: string | null;
  referralCode: string | null;
  totalReferrals: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: any[];
  verification_document: {
    id: string;
    user_id: string;
    idType: string;
    frontPage: string | null;
    companyName: string | null;
    rcNumber: string | null;
    cacDocument: string | null;
    backPage: string | null;
    authorizedId: string | null;
    authorizedName: string | null;
    utilityBill: string | null;
    address: string;
    verificationType: string;
    status: string;
    submitedAt: string;
    RejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
  bank_account: {
    id: string;
    user_id: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
    account_name: string;
    country: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
}

export interface ADMIN_KYC_RESPONSE {
  id: string;
  user_id: string;
  idType: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  frontPage: string | null;
  companyName: string | null;
  rcNumber: string | null;
  cacDocument: string | null;
  backPage: string | null;
  authorizedId: string | null;
  authorizedName: string | null;
  utilityBill: string | null;
  address: string;
  verificationType: "INDIVIDUAL" | "CORPORATE";
  submitedAt: string;
  RejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: {
    id: string;
    profilePicture: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isEmailVerified: boolean;
    accountType: string;
    companyName: string | null;
    account_status: string;
    account_verification_status: string;
    referral_source: string;
    partnerType: string | null;
    referralCode: string | null;
    totalReferrals: number;
    totalCommission: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface ADMIN_PROPERTY_LISTING {
  id: string;
  propertyTitle: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  investmentModel:
    | "SAVE_TO_OWN"
    | "FRACTIONAL_OWNERSHIP"
    | "LAND_BANKING"
    | "OUTRIGHT_PURCHASE"
    | "CO_DEVELOPMENT";

  location: string;
  description: string;
  developmentStage: "PLANNING" | "FOUNDATION" | "ROOFING" | "FINISHED";
  completionDate: string;
  published: boolean;
  premiumProperty: boolean;
  coverImage: string;
  galleryImages: string[];
  videos: string | null;
  certificate: string | null;
  surveyPlanDocument: string | null;
  brochure: string | null;
  transferDocument: string | null;
  buildingPermitNumber: string | null;
  propertyDocument: string | null;
  propertyTitleDocuments: { type: string; documentUrl: string }[] | null;
  basePrice: number;
  availableUnits: number;
  totalPrice: number;
  paymentOption: string | null;
  installmentDuration: number | null;
  minimumInvestment: number | null;
  profitSharingRatio: number | null;
  projectDuration: number | null;
  exitRule: string | null;
  totalShares: number | null;
  pricePerShare: number | null;
  minimumShares: number | null;
  exitWindow: number | null;
  availablePlots: string | null;
  pricePerPlot: number | null;
  holdingPeriod: number | null;
  buyBackOption: boolean | null;
  targetPropertyPrice: number;
  savingsFrequency: "YEARLY" | "WEEKLY" | "MONTHLY" | null;
  savingsDuration: number | null;
  createdAt: string;
  updatedAt: string;
  additionalFees: any[];
}

export interface PROPERTY_DATA {
  id: string;
  propertyTitle: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  investmentModel: "SAVE_TO_OWN" | "RENT_TO_OWN" | "INVESTMENT" | "OUTRIGHT";
  location: string;
  description: string;
  developmentStage: "PLANNING" | "FOUNDATION" | "ROOFING" | "FINISHED";
  completionDate: string;
  published: boolean;
  premiumProperty: boolean;
  coverImage: string;
  galleryImages: string[];
  videos: string | null;
  certificate: string | null;
  surveyPlanDocument: string | null;
  brochure: string | null;
  transferDocument: string | null;
  basePrice: number;
  availableUnits: number;
  totalPrice: number;
  paymentOption: string | null;
  installmentDuration: number | null;
  minimumInvestment: number | null;
  profitSharingRatio: number | null;
  projectDuration: number | null;
  exitRule: string | null;
  totalShares: number | null;
  pricePerShare: number | null;
  minimumShares: number | null;
  exitWindow: number | null;
  availablePlots: string | null;
  pricePerPlot: number | null;
  holdingPeriod: number | null;
  buyBackOption: boolean | null;
  targetPropertyPrice: number;
  savingsFrequency: "YEARLY" | "WEEKLY" | "MONTHLY" | null;
  savingsDuration: number | null;
  createdAt: string;
  updatedAt: string;
  additionalFees: any[];
}

export type SINGLE_PROPERTY = {
  id: string;
  propertyTitle: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  investmentModel: "SAVE_TO_OWN" | "RENT_TO_OWN" | "INVESTMENT" | "OUTRIGHT";
  location: string;
  description: string;
  developmentStage: "PLANNING" | "FOUNDATION" | "ROOFING" | "FINISHED";
  completionDate: string;
  published: boolean;
  premiumProperty: boolean;
  coverImage: string;
  galleryImages: string[];
  videos: string | null;
  certificate: string | null;
  surveyPlanDocument: string | null;
  brochure: string | null;
  transferDocument: string | null;
  basePrice: number;
  availableUnits: number;
  totalPrice: number;
  paymentOption: string | null;
  installmentDuration: number | null;
  minimumInvestment: number | null;
  profitSharingRatio: number | null;
  projectDuration: number | null;
  exitRule: string | null;
  totalShares: number | null;
  pricePerShare: number | null;
  minimumShares: number | null;
  exitWindow: number | null;
  availablePlots: string | null;
  pricePerPlot: number | null;
  holdingPeriod: number | null;
  buyBackOption: boolean | null;
  targetPropertyPrice: number;
  savingsFrequency: "YEARLY" | "WEEKLY" | "MONTHLY" | null;
  savingsDuration: number | null;
  createdAt: string;
  updatedAt: string;
  additionalFees: any[];
};

export interface USER_KYC {
  id: string;
  profilePicture: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  accountType: "INDIVIDUAL";
  companyName: string | null;
  account_status: "ACTIVE";
  account_verification_status: "VERIFIED";
  referral_source: string;
  partnerType: string | null;
  referralCode: string | null;
  totalReferrals: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: {
    userId: string;
    roleId: string;
    assignedAt: string;
    role: {
      name: string;
      permissions: {
        roleId: string;
        permissionId: string;
        createdAt: string;
        permission: {
          key: string;
          description: string;
        };
      }[];
    };
  }[];
  verification_document: {
    id: string;
    user_id: string;
    idType: string;
    frontPage: string | null;
    companyName: string | null;
    rcNumber: string | null;
    cacDocument: string | null;
    backPage: string | null;
    authorizedId: string | null;
    authorizedName: string | null;
    utilityBill: string | null;
    address: string;
    verificationType: string;
    status: string;
    submitedAt: string;
    RejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
  bank_account: {
    id: string;
    user_id: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
    account_name: string;
    country: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  } | null;
}
