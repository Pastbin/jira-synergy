require('@testing-library/jest-dom');

// Mock для Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock для Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Простой мок без JSX
    return { props };
  },
}));