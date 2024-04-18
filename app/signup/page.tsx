import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SignupForm } from '@/components/SignupForm';

export default function Signup() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex w-1/4 justify-start mb-6">
        <Breadcrumbs />
      </div>
      <SignupForm />
    </div>
  );
}
