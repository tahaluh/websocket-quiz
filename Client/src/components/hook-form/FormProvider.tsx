// form
import { FormProvider as Form, UseFormReturn } from 'react-hook-form';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  methods: UseFormReturn<any>;
  onSubmit?: VoidFunction;
  noValidate?: boolean;
};

export default function FormProvider({ children, onSubmit, methods, noValidate = false }: Props) {
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit} noValidate={noValidate}>{children}</form>
    </Form>
  );
}
