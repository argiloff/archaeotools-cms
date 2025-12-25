import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Layout } from './ui/Layout';
import { ProjectIntelPage } from '../modules/project-intel/ProjectIntelPage';
import { MediaManagerPage } from '../modules/media-manager/MediaManagerPage';
import { DataQualityPage } from '../modules/data-quality/DataQualityPage';
import { OsintPage } from '../modules/osint/OsintPage';
import { CacheStudioPage } from '../modules/cache-studio/CacheStudioPage';
import { LoginPage } from '../modules/auth/LoginPage';
import { RequireAuth } from './RequireAuth';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ProjectIntelPage /> },
      { path: 'media', element: <MediaManagerPage /> },
      { path: 'data-quality', element: <DataQualityPage /> },
      { path: 'osint', element: <OsintPage /> },
      { path: 'cache', element: <CacheStudioPage /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  );
}
