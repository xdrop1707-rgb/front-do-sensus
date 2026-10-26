import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="pr-4">
          <h1 className="text-5xl font-bold text-[#004E6E] mb-6 leading-[1.1]">
            Seu bem-estar mental<br/>em primeiro lugar.
          </h1>
          <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-lg">
            A Clínica Universitária oferece suporte psicológico acessível, unindo excelência acadêmica e cuidado humanizado. Encontre o espaço seguro que você precisa para crescer.
          </p>
          <Link
            href="/especialistas"
            className="inline-block bg-[#004E6E] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-opacity-90 transition shadow-md"
          >
            Agendar Consulta
          </Link>
        </div>
        
                <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg bg-[#E6F0F3]">
            <Image 
              src="/clinica.jpg" 
              alt="Clínica" 
              fill 
              className="object-cover" 
            />
        </div>
      </section>

      {/* Barra de Busca */}
      <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-16 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative -mt-10 mx-4 md:mx-0">
        <h2 className="text-xl font-bold text-[#004E6E] mb-6">Encontre um Horário</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">TIPO DE SERVIÇO</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#004E6E] bg-white appearance-none cursor-pointer">
              <option>Atendimento Individual</option>
              <option>Apoio Psicológico</option>
              <option>Terapia em Grupo</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">MODALIDADE</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#004E6E] bg-white appearance-none cursor-pointer">
              <option>Presencial</option>
              <option>Online</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">DISPONIBILIDADE</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Terça-feira, Manhã"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#004E6E]"
              />
              <svg className="absolute right-4 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}