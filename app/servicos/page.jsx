export default function Servicos() {
  return (
    <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E] mb-4">
          Nossos Serviços
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Conheça os tipos de atendimento oferecidos pela clínica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Atendimento Individual
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Sessões focadas no desenvolvimento pessoal e superação de desafios
              acadêmicos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Apoio Psicológico
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Sessões remotas para orientação breve e acolhimento emocional.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Terapia em Grupo
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Grupos de vivência sobre ansiedade acadêmica e transição de
              carreira.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-2">
              Plantão Psicológico
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Atendimento emergencial para situações de crise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
