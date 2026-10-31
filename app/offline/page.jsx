"use client";

export default function Offline() {
  return (
    <div className="max-w-md mx-auto px-8 py-16 text-center">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#004E6E] mb-4">Você está offline</h1>
        <p className="text-gray-600 mb-8">
          Não foi possível carregar esta página. Verifique sua conexão com a internet e tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#004E6E] text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}