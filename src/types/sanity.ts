export interface InspiredArtist {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  profileImage: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  description?: any[];
}

export interface Category {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
}

export interface Author {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  profileImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
}

export interface AudioMetadata {
  numberOfSamples: number;
}

export interface AudioFile {
  asset: {
    _ref: string;
    _type: string;
    url?: string;
  };
  alt?: string;
}

export interface SamplePack {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  price: number;
  coverImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  preview?: AudioFile;
  description?: any[];
  metadata?: AudioMetadata;
  createdByArtists?: any[];
  inspiredArtists?: any[];
  genres?: any[];
  instruments?: any[];
  formats?: any[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedDate: string;
  excerpt?: string;
  coverImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  content?: any[]; // Portable Text content
  categories?: Category[];
  authors?: Author[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}
