// Mock implementation of astro:content for tests
export const getCollection = async (collection: string, filter?: any) => {
  // Return empty array by default - tests should mock this with vi.mock()
  return [];
};
