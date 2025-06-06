import SimpleSteps from '@/components/SimpleSteps';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/usd.png"
              alt="USD Stack Wallet Logo"
              className="w-80 sm:w-60 h-auto object-contain logo-img"
            />
          </div>
        
          
              </div>

        <SimpleSteps />

      </div>
    </div>
  );
}
