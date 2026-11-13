export type OrgType = "shelter" | "zoo" | "clinic";

export interface Org {
  id: string;
  name: string;
  type: OrgType;
  city: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  rating: number;
  reviewsCount: number;
  image: string;
  needs: string[];
}

export type Species = "dog" | "cat" | "other";

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: number;
  sex: "male" | "female";
  city: string;
  orgId: string;
  description: string;
  image: string;
  vaccinated: boolean;
  sterilized: boolean;
  status: "available" | "reserved" | "adopted";
}

export interface ClinicService {
  id: string;
  orgId: string;
  name: string;
  price: number;
  description: string;
}

export interface Fundraiser {
  id: string;
  orgId: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  image: string;
}

export interface EventItem {
  id: string;
  orgId: string;
  title: string;
  date: string;
  city: string;
  description: string;
  price: number | null;
  image: string;
}

export type ListingKind = "rehoming" | "lost" | "found" | "service";

export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  description: string;
  city: string;
  phone: string;
  date: string;
  image?: string;
}
