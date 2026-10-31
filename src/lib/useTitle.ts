import { useEffect } from 'react';
import { BRAND_NAME } from '../config';

export function useTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} — ${BRAND_NAME}`;
  }, [title]);
}
