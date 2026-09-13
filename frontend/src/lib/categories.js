// Category ids are defined by the backend — these labels and the editorial
// copy below are the only client-side additions. Do not renumber.

export const CATEGORIES = {
  0: 'All Categories',
  1: 'Electronics',
  2: 'Home & Garden',
  3: 'Fashion',
  4: 'Others',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).filter(([id]) => id !== '0');

// Department copy for the editorial category index on the home page.
export const DEPARTMENTS = [
  { id: 1, name: 'Electronics', note: 'Cameras, audio, computing and the hardware people queue for.' },
  { id: 2, name: 'Home & Garden', note: 'Furniture, ceramics, tools and things that outlive their owners.' },
  { id: 3, name: 'Fashion', note: 'Wardrobe pieces, leather, watches and wearable archive.' },
  { id: 4, name: 'Others', note: 'Everything that refuses a department. Usually the interesting part.' },
];
