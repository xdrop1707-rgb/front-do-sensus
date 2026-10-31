// app/clinica/page.jsx
export default function Clinica() {
  return (
    <div className="w-full min-h-[80vh] bg-[#E6F0F3] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E] mb-4">
          Nossa Clínica
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
          A Clínica Universitária de Psicologia é um espaço de cuidado e
          acolhimento, integrado ao ambiente acadêmico, oferecendo atendimento
          de qualidade à comunidade.
        </p>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-[#004E6E] mb-3">
            Nossa Missão
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Promover o bem-estar mental e emocional, unindo a excelência
            acadêmica à prática clínica humanizada, com foco no desenvolvimento
            integral dos indivíduos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#004E6E] mb-2">Estrutura</h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Salas de atendimento individual e espaços para grupos, preparados
              para acolher com conforto e privacidade.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#004E6E] mb-2">Equipe</h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Psicólogos experientes e estagiários supervisionados,
              comprometidos com a ética e o cuidado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
