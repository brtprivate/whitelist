import SimpleSteps from '@/components/SimpleSteps';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-lg sm:max-w-2xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            USDT Stack
          </h1>
        </div>

        <SimpleSteps />


      </div>
    </div>
  );
}
