import { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { AnyObjectSchema } from 'yup';

export function useLocalizedResolver(schema: AnyObjectSchema) {
  return useMemo(() => yupResolver(schema) as never, [schema]);
}
