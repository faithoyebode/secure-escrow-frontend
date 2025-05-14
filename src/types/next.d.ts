
import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export interface PageParams {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
