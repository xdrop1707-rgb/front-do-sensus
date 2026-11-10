// app/recursos/page.jsx
export default function Recursos() {
  return (
    <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E] mb-4">
          Recursos
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Materiais de apoio e informações úteis para o seu bem-estar.
        </p>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Guia de Saúde Mental
            </h2>
            <p className="text-gray-500 text-sm md:text-base mb-3">
              Dicas práticas para lidar com ansiedade, estresse e outras
              questões do dia a dia.
            </p>
            <span className="inline-block bg-[#E6F0F3] text-[#004E6E] px-3 py-1 rounded-full text-xs font-bold uppercase">
              Em breve
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Meditações Guiadas
            </h2>
            <p className="text-gray-500 text-sm md:text-base mb-3">
              Áudios para relaxamento e mindfulness, ajudando a acalmar a mente.
            </p>
            <span className="inline-block bg-[#E6F0F3] text-[#004E6E] px-3 py-1 rounded-full text-xs font-bold uppercase">
              Em breve
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm relative overflow-hidden border border-red-100">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Contatos de Emergência
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Se você estiver em crise, procure ajuda imediatamente:{" "}
              <strong className="text-gray-700">CVV (188)</strong> ou{" "}
              <strong className="text-gray-700">SAMU (192)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
