export type AccountType = "INDIVIDUAL" | "INVESTOR" | "PARTNER" | "CORPORATE" | "ADMIN";

export interface USER {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  phoneNumber?: string;
  createdAt?: string;
  companyName?: string;
}

export interface USER_KYC {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt?: string;
  reviewedAt?: string;
}
