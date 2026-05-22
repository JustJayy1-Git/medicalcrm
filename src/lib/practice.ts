export type PracticeInfo = {
  name: string;
  taxId: string;
  npi: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
};

export function getPracticeFromEnv(): PracticeInfo {
  return {
    name: process.env.NEXT_PUBLIC_PRACTICE_NAME?.trim() || "PRO INJURY LLC",
    taxId: process.env.NEXT_PUBLIC_PRACTICE_TAX_ID?.trim() || "",
    npi: process.env.NEXT_PUBLIC_PRACTICE_NPI?.trim() || "",
    phone: process.env.NEXT_PUBLIC_PRACTICE_PHONE?.trim() || "",
    addressLine1: process.env.NEXT_PUBLIC_PRACTICE_ADDRESS1?.trim() || "",
    addressLine2: "",
    city: process.env.NEXT_PUBLIC_PRACTICE_CITY?.trim() || "",
    state: process.env.NEXT_PUBLIC_PRACTICE_STATE?.trim() || "FL",
    zip: process.env.NEXT_PUBLIC_PRACTICE_ZIP?.trim() || "",
  };
}

export function mergePracticeWithFacility(
  practice: PracticeInfo,
  facility: {
    name?: string | null;
    npi?: string | null;
    tax_id?: string | null;
    phone?: string | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  } | null,
): PracticeInfo {
  if (!facility) return practice;
  return {
    ...practice,
    name: facility.name?.trim() || practice.name,
    taxId: facility.tax_id?.trim() || practice.taxId,
    npi: facility.npi?.trim() || practice.npi,
    phone: facility.phone?.trim() || practice.phone,
    addressLine1: facility.address_line1?.trim() || practice.addressLine1,
    city: facility.city?.trim() || practice.city,
    state: facility.state?.trim() || practice.state,
    zip: facility.zip?.trim() || practice.zip,
  };
}
