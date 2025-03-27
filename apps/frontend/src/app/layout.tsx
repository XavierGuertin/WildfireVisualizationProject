import ClientLayout from './client-layout';
import React from 'react';

export const metadata = {
  title: 'WildfireVisualizationPlatform',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
